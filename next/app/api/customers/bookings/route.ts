import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { BookingModel } from "../../shared/models/booking";

function getUserId(req: NextRequest): string | null {
  const cookie = req.cookies.get("user_token");
  if (!cookie?.value) return null;

  return decodeUserId(cookie.value);
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

    const body = await readJsonObject(req);
    const { service_id, scheduled_at, notes } = body;

    if (typeof service_id !== "string" || !/^\d+$/.test(service_id.trim())) {
      return NextResponse.json({ success: false, message: "A valid service is required" }, { status: 400 });
    }

    if (scheduled_at !== undefined && scheduled_at !== null) {
      return NextResponse.json({ success: false, message: "Add the service first, then schedule all services together from the booking page." }, { status: 400 });
    }

    const booking = await BookingModel.createBookingDoc({
      user_id,
      service_id: service_id.trim(),
      notes: typeof notes === "string" ? notes : null,
    });

    if (!booking) {
      return NextResponse.json({ success: false, message: "Service not found or unavailable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: booking, message: "Service added to your bookings" }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
