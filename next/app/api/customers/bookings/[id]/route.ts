import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { BookingModel } from "../../../shared/models/booking";

function getUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get("user_token");
  if (!cookie?.value) return null;

  return decodeUserId(cookie.value);
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
    const body = await readJsonObject(req);
    const { scheduled_at, notes, status, payment_status } = body;

    if (scheduled_at !== undefined && typeof scheduled_at !== "string") {
      return NextResponse.json({ success: false, message: "Invalid booking time" }, { status: 400 });
    }
    if (scheduled_at) {
      const date = new Date(scheduled_at);
      if (Number.isNaN(date.getTime())) {
        return NextResponse.json({ success: false, message: "Invalid booking time" }, { status: 400 });
      }
    }

    const bookingStatus = status === "pending" || status === "confirmed" || status === "cancelled" || status === "completed"
      ? status
      : undefined;
    const bookingPaymentStatus = payment_status === "pending" || payment_status === "paid" || payment_status === "failed" || payment_status === "refunded"
      ? payment_status
      : undefined;

    if (notes !== undefined && notes !== null && typeof notes !== "string") {
      return NextResponse.json({ success: false, message: "Invalid booking notes" }, { status: 400 });
    }
    if (status !== undefined && !bookingStatus) {
      return NextResponse.json({ success: false, message: "Invalid booking status" }, { status: 400 });
    }
    if (payment_status !== undefined && !bookingPaymentStatus) {
      return NextResponse.json({ success: false, message: "Invalid payment status" }, { status: 400 });
    }

    const booking = await BookingModel.updateBookingDoc({
      id,
      user_id,
      scheduled_at: scheduled_at ? new Date(scheduled_at).toISOString() : undefined,
      notes: typeof notes === "string" ? notes : notes === null ? null : undefined,
      status: bookingStatus,
      payment_status: bookingPaymentStatus,
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
