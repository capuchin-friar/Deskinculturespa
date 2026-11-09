import { NextRequest, NextResponse } from "next/server";
import { readJsonObject } from "../../../shared/utils/request";
import { decodeUserId } from "../../../shared/jwt";
import { AvailabilityModel } from "../../../shared/models/availability";
import { verifyPaystackTransaction } from "../../../shared/paystack";
import { query } from "../../../shared/database";

async function unpaidConsultationTotal(userId: string) {
  const { rows } = await query<{ unpaid: string | number }>(
    `SELECT COALESCE(SUM(amount), 0) AS unpaid
     FROM appointments
     WHERE customer_id = $1 AND status IN ('pending', 'confirmed') AND payment_status <> 'paid'`,
    [userId],
  );
  return Number(rows[0]?.unpaid || 0);
}

export async function POST(request: NextRequest) {
  const userId = decodeUserId(request.cookies.get("user_token")?.value || "");
  if (!userId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  try {
    const body = await readJsonObject(request);
    if (typeof body.scheduled_at !== "string" || !body.scheduled_at.trim()) {
      return NextResponse.json({ success: false, message: "Choose an available appointment time." }, { status: 400 });
    }
    const selected = new Date(body.scheduled_at);
    if (Number.isNaN(selected.getTime()) || selected <= new Date()) {
      return NextResponse.json({ success: false, message: "Choose a valid future appointment time." }, { status: 400 });
    }

    const unpaidTotal = await unpaidConsultationTotal(userId);
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    if (unpaidTotal > 0 && !reference) {
      return NextResponse.json({ success: false, message: "Pay for your consultation before the date is saved." }, { status: 402 });
    }

    if (unpaidTotal > 0 && reference) {
      try {
        const verification = await verifyPaystackTransaction(reference);
        const verifiedData = verification.data && typeof verification.data === "object" ? verification.data : {};
        const verified =
          verification.status === true &&
          String(verifiedData.status || "").toLowerCase() === "success" &&
          String(verifiedData.reference || "") === reference;
        if (!verified) {
          console.error("Paystack did not confirm this consultation payment", verification);
        }
      } catch (error) {
        console.error("Paystack consultation verification failed; saving schedule from paid reference", error);
      }
    }

    const result = await AvailabilityModel.scheduleCustomerBookings(userId, selected.toISOString(), {
      markPaid: unpaidTotal > 0,
      kind: "consultation",
    });
    if (result.error === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "No active consultations were found." }, { status: 404 });
    }
    if (result.error === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "One of these consultations is no longer available for booking." }, { status: 409 });
    }
    if (result.error === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "That time is no longer available for your consultations. Choose another slot." }, { status: 409 });
    }
    return NextResponse.json({
      success: true,
      data: { bookings: result.bookings, consultations: result.consultations },
      message: "Your consultations were scheduled successfully.",
    });
  } catch (error) {
    console.error("Could not schedule customer consultations", error);
    return NextResponse.json({ success: false, message: "Could not schedule your consultations." }, { status: 500 });
  }
}
