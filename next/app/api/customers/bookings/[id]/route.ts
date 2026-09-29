import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { BookingModel } from "../../../shared/models/booking";
import { AvailabilityModel } from "../../../shared/models/availability";

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

    if (scheduled_at !== undefined && (typeof scheduled_at !== "string" || !scheduled_at.trim())) {
      return NextResponse.json({ success: false, message: "Invalid booking time" }, { status: 400 });
    }
    let scheduledAt: string | undefined;
    if (scheduled_at) {
      const date = new Date(scheduled_at);
      if (Number.isNaN(date.getTime()) || date <= new Date()) {
        return NextResponse.json({ success: false, message: "Choose a valid future booking time" }, { status: 400 });
      }
      scheduledAt = date.toISOString();
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

    if (scheduledAt) {
      const targetBooking = await BookingModel.getBookingDoc({ id, user_id });
      if (!targetBooking || !["pending", "confirmed"].includes(String(targetBooking.status))) {
        return NextResponse.json({ success: false, message: "Booking not found or can no longer be scheduled." }, { status: 404 });
      }
    }
    const schedulingResult = scheduledAt
      ? await AvailabilityModel.scheduleCustomerBookings(user_id, scheduledAt)
      : null;
    if (schedulingResult?.error === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ success: false, message: "Booking not found or can no longer be scheduled." }, { status: 404 });
    }
    if (schedulingResult?.error === "SLOT_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "That time is no longer available for all your services. Choose another slot." }, { status: 409 });
    }
    if (schedulingResult?.error === "SERVICE_UNAVAILABLE") {
      return NextResponse.json({ success: false, message: "One of these services is no longer available for booking." }, { status: 409 });
    }
    if (schedulingResult?.bookings) {
      return NextResponse.json({ success: true, data: schedulingResult.bookings, message: "All services were scheduled successfully." }, { status: 200 });
    }
    const booking = await BookingModel.updateBookingDoc({
          id,
          user_id,
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
