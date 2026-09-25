import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BookingModel } from "../../lib/models/booking";

function getUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get("user_token");
  if (!cookie?.value) return null;

  const decoded = jwt.decode(cookie.value);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) return null;

  return String(decoded.id);
}

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    const { id } = await params;
    const booking = await BookingModel.getBookingDoc({ id, user_id });

    if (!booking) return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: booking }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { scheduled_at, notes, status, payment_status } = body;

    if (scheduled_at) {
      const date = new Date(scheduled_at);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ success: false, message: "Invalid booking time" }, { status: 400 });
      }
    }

    const booking = await BookingModel.updateBookingDoc({
      id,
      user_id,
      scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : undefined,
      notes,
      status,
      payment_status,
    });

    if (!booking) return NextResponse.json({ success: false, message: "Booking not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: booking, message: "Booking updated successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user_id = getUserId(req);
    if (!user_id) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });

    const { id } = await params;
    const deleted = await BookingModel.deleteBookingDoc({ id, user_id });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Only pending bookings can be deleted" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Booking deleted successfully" }, { status: 200 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
