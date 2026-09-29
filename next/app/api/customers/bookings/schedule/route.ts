import { NextRequest, NextResponse } from "next/server";
import { readJsonObject } from "../../../shared/utils/request";
import { decodeUserId } from "../../../shared/jwt";
import { AvailabilityModel } from "../../../shared/models/availability";

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
    const result = await AvailabilityModel.scheduleCustomerBookings(userId, selected.toISOString());
    if (result.error === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "No active service bookings were found." }, { status: 404 });
    }
    if (result.error === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "One of these services is no longer available for booking." }, { status: 409 });
    }
    if (result.error === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "That time is no longer available for all your services. Choose another slot." }, { status: 409 });
    }
    return NextResponse.json({ success: true, data: result.bookings, message: "All services were scheduled successfully." });
  } catch {
    return NextResponse.json({ success: false, message: "Could not schedule your services." }, { status: 500 });
  }
}
