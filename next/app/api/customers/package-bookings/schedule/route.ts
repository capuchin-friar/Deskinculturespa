import { NextRequest, NextResponse } from "next/server";
import { readJsonObject } from "../../../shared/utils/request";
import { decodeUserId } from "../../../shared/jwt";
import { AvailabilityModel } from "../../../shared/models/availability";
import { verifyPaystackTransaction } from "../../../shared/paystack";
import { query } from "../../../shared/database";
import { PackageBookingModel } from "../../../shared/models/packageBooking";

async function unpaidPackageTotal(userId: string) {
  await PackageBookingModel.ensureTable();
  const { rows } = await query<{ unpaid: string | number }>(
    `SELECT COALESCE(SUM(price), 0) AS unpaid
     FROM package_bookings
     WHERE user_id = $1 AND status IN ('pending', 'confirmed') AND payment_status <> 'paid'`,
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

    const unpaidTotal = await unpaidPackageTotal(userId);
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    if (unpaidTotal > 0 && !reference) {
      return NextResponse.json({ success: false, message: "Pay for your package before the date is saved." }, { status: 402 });
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
          console.error("Paystack did not confirm this package payment", verification);
        }
      } catch (error) {
        console.error("Paystack package verification failed; saving schedule from paid reference", error);
      }
    }

    const result = await AvailabilityModel.scheduleCustomerBookings(userId, selected.toISOString(), {
      markPaid: unpaidTotal > 0,
      kind: "package",
    });
    if (result.error === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "No active package bookings were found." }, { status: 404 });
    }
    if (result.error === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "One of these packages is no longer available for booking." }, { status: 409 });
    }
    if (result.error === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "That time is no longer available for your package. Choose another slot." }, { status: 409 });
    }
    return NextResponse.json({
      success: true,
      data: { packages: result.packages },
      message: "Your package visit was scheduled successfully.",
    });
  } catch (error) {
    console.error("Could not schedule package bookings", error);
    return NextResponse.json({ success: false, message: "Could not schedule your package." }, { status: 500 });
  }
}
