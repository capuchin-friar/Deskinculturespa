import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { requireUser } from "../../lib/auth/user";
import { createPendingPayment } from "../../lib/payments/checkout";

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const serviceId = Number(body.service_id);
    const scheduledAt = new Date(body.scheduled_at);
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    if (!Number.isInteger(serviceId) || serviceId <= 0 || Number.isNaN(scheduledAt.getTime())) {
      return NextResponse.json(
        { success: false, data: "service_id and a valid scheduled_at are required" },
        { status: 400 },
      );
    }

    if (scheduledAt.getTime() <= Date.now()) {
      return NextResponse.json(
        { success: false, data: "A service booking must be scheduled in the future" },
        { status: 400 },
      );
    }

    const client = await db();
    let orderId: number;
    let bookingId: number;
    let price: number;

    try {
      await client.query("BEGIN");

      const serviceResult = await client.query(
        `SELECT id, price, duration_minutes, is_active
         FROM services
         WHERE id = $1
         FOR UPDATE`,
        [serviceId],
      );
      const service = serviceResult.rows[0];
      if (!service || !service.is_active) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, data: "Service not found or unavailable" }, { status: 404 });
      }

      price = Number(service.price);

      const bookingResult = await client.query(
        `INSERT INTO bookings (
           user_id, service_id, scheduled_at, price, status, payment_status, notes
         ) VALUES ($1,$2,$3,$4,'pending','pending',$5)
         RETURNING id`,
        [user.id, serviceId, scheduledAt, price, notes],
      );
      bookingId = Number(bookingResult.rows[0].id);

      const orderResult = await client.query(
        `INSERT INTO orders (
           customer_id, order_type, status, payment_status,
           amount_paid, shipping_fee, currency, discount, total_paid,
           total_amount, shipping_address
         ) VALUES ($1,'service','pending','pending',0,0,'NGN',0,0,$2,NULL)
         RETURNING id`,
        [user.id, price],
      );
      orderId = Number(orderResult.rows[0].id);

      await client.query(
        `UPDATE bookings SET order_id = $1, updated_at = NOW() WHERE id = $2`,
        [orderId, bookingId],
      );

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
      amount: price,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        booking_id: bookingId,
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
