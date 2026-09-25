import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BookingModel } from "../lib/models/booking";

function getUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get("user_token");
  if (!cookie?.value) return null;

  const decoded = jwt.decode(cookie.value);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) return null;

  return String(decoded.id);
}

export const GET = async (req: NextRequest) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const data = await BookingModel.getAllBookingDocs({ user_id });
    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
    }

    const body = await req.json();
    const { service_id, scheduled_at, notes } = body;

    if (!service_id || !scheduled_at) {
      return NextResponse.json({ success: false, message: "Service and booking time are required" }, { status: 400 });
    }

    const scheduledDate = new Date(scheduled_at);
    if (Number.isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      return NextResponse.json({ success: false, message: "A valid future booking time is required" }, { status: 400 });
    }

    const booking = await BookingModel.createBookingDoc({
      user_id,
      service_id: String(service_id),
      scheduled_at: scheduledDate.toISOString(),
      notes: notes ?? null,
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Service not found or unavailable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking, message: "Service booked successfully" }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
