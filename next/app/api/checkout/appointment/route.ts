import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { requireUser } from "../../lib/auth/user";
import { createPendingPayment } from "../../lib/payments/checkout";

function toMinutes(value: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
}

function formatTime(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, "0");
  const mins = (minutes % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:00`;
}

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const offeringId = Number(body.offering_id);
    const appointmentDate = typeof body.appointment_date === "string" ? body.appointment_date : "";
    const startTime = typeof body.start_time === "string" ? body.start_time : "";
    const notes = typeof body.notes === "string" ? body.notes.trim() : null;

    if (!Number.isInteger(offeringId) || offeringId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate)) {
      return NextResponse.json(
        { success: false, data: "offering_id and a valid appointment_date are required" },
        { status: 400 },
      );
    }

    const startMinutes = toMinutes(startTime);
    if (startMinutes === null) {
      return NextResponse.json({ success: false, data: "start_time must use HH:mm" }, { status: 400 });
    }

    const client = await db();
    let orderId: number;
    let appointmentId: number;
    let price: number;

    try {
      await client.query("BEGIN");

      const offeringResult = await client.query(
        `SELECT id, consultant_id, duration_minutes, price, is_active
         FROM consultation_offerings
         WHERE id = $1
         FOR UPDATE`,
        [offeringId],
      );
      const offering = offeringResult.rows[0];
      if (!offering || !offering.is_active) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, data: "Consultation offering not found or unavailable" }, { status: 404 });
      }

      const endMinutes = startMinutes + Number(offering.duration_minutes);
      if (endMinutes > 24 * 60) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, data: "Appointment ends outside the selected day" }, { status: 400 });
      }

      price = Number(offering.price);

      const conflict = await client.query(
        `SELECT 1
         FROM appointments
         WHERE consultant_id = $1
           AND appointment_date = $2
           AND status IN ('pending','confirmed')
           AND start_time < $4::time
           AND end_time > $3::time
         LIMIT 1`,
        [offering.consultant_id, appointmentDate, formatTime(startMinutes), formatTime(endMinutes)],
      );
      if (conflict.rows.length > 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, data: "The selected consultation time is no longer available" }, { status: 409 });
      }

      const appointmentResult = await client.query(
        `INSERT INTO appointments (
           customer_id, consultant_id, offering_id,
           appointment_date, start_time, end_time,
           amount, status, payment_status, notes
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,'pending','pending',$8)
         RETURNING id`,
        [
          user.id,
          offering.consultant_id,
          offeringId,
          appointmentDate,
          formatTime(startMinutes),
          formatTime(endMinutes),
          price,
          notes,
        ],
      );
      appointmentId = Number(appointmentResult.rows[0].id);

      const orderResult = await client.query(
        `INSERT INTO orders (
           customer_id, order_type, status, payment_status,
           amount_paid, shipping_fee, currency, discount, total_paid,
           total_amount, shipping_address
         ) VALUES ($1,'appointment','pending','pending',0,0,'NGN',0,0,$2,NULL)
         RETURNING id`,
        [user.id, price],
      );
      orderId = Number(orderResult.rows[0].id);

      await client.query(
        `UPDATE appointments SET order_id = $1, updated_at = NOW() WHERE id = $2`,
        [orderId, appointmentId],
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
      orderType: "appointment",
      amount: price,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        appointment_id: appointmentId,
        transaction_id: payment.transactionId,
        reference: payment.reference,
        authorization_url: payment.authorizationUrl,
        access_code: payment.accessCode,
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize appointment checkout";
    const status = message.includes("AUTHENTICATION") ? 401 : 500;
    return NextResponse.json({ success: false, data: message }, { status });
  }
};
