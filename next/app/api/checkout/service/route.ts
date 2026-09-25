import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { requireUser } from "../../lib/auth/user";
import { createPendingPayment } from "../../lib/payments/checkout";

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser(request);
    const body = await request.json();

    const rawItems = Array.isArray(body.items)
      ? body.items
      : [{ service_id: body.service_id, scheduled_at: body.scheduled_at, notes: body.notes }];

    if (rawItems.length === 0 || rawItems.length > 20) {
      return NextResponse.json({ success: false, data: "At least one service is required" }, { status: 400 });
    }

    const items = rawItems.map((item) => ({
      serviceId: Number(item.service_id),
      scheduledAt: new Date(item.scheduled_at),
      notes: typeof item.notes === "string" ? item.notes.trim() : null,
    }));

    if (items.some((item) => !Number.isInteger(item.serviceId) || item.serviceId <= 0 || Number.isNaN(item.scheduledAt.getTime()))) {
      return NextResponse.json({ success: false, data: "Each service requires a valid service_id and scheduled_at" }, { status: 400 });
    }

    if (items.some((item) => item.scheduledAt.getTime() <= Date.now())) {
      return NextResponse.json({ success: false, data: "Service bookings must be scheduled in the future" }, { status: 400 });
    }

    const client = await db();
    let orderId: number;
    let total = 0;
    const bookingIds: number[] = [];

    try {
      await client.query("BEGIN");

      const serviceIds = items.map((item) => item.serviceId);
      const serviceResult = await client.query(
        `SELECT id, price, is_active
         FROM services
         WHERE id = ANY($1::int[])
         FOR UPDATE`,
        [serviceIds],
      );

      const services = new Map(serviceResult.rows.map((service) => [Number(service.id), service]));
      for (const item of items) {
        const service = services.get(item.serviceId);
        if (!service || !service.is_active) {
          await client.query("ROLLBACK");
          return NextResponse.json({ success: false, data: `Service ${item.serviceId} is unavailable` }, { status: 404 });
        }
        total += Number(service.price);
      }

      const orderResult = await client.query(
        `INSERT INTO orders (
           customer_id, order_type, status, payment_status,
           amount_paid, shipping_fee, currency, discount, total_paid,
           total_amount, shipping_address
         ) VALUES ($1,'service','pending','pending',0,0,'NGN',0,0,$2,NULL)
         RETURNING id`,
        [user.id, total],
      );
      orderId = Number(orderResult.rows[0].id);

      for (const item of items) {
        const service = services.get(item.serviceId)!;
        const bookingResult = await client.query(
          `INSERT INTO bookings (
             user_id, service_id, scheduled_at, price, status, payment_status, notes, order_id
           ) VALUES ($1,$2,$3,$4,'pending','pending',$5,$6)
           RETURNING id`,
          [user.id, item.serviceId, item.scheduledAt, Number(service.price), item.notes, orderId],
        );
        bookingIds.push(Number(bookingResult.rows[0].id));
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const payment = await createPendingPayment({
      orderId,
      customerId: Number(user.id),
      orderType: "service",
      amount: total,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        booking_ids: bookingIds,
        transaction_id: payment.transactionId,
        reference: payment.reference,
        authorization_url: payment.authorizationUrl,
        access_code: payment.accessCode,
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize service checkout";
    const status = message.includes("AUTHENTICATION") ? 401 : 500;
    return NextResponse.json({ success: false, data: message }, { status });
  }
};
