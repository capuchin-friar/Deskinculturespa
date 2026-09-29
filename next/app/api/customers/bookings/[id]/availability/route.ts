import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../../shared/jwt";
import { AvailabilityModel } from "../../../../shared/models/availability";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const userId = decodeUserId(request.cookies.get("user_token")?.value || "");
  if (!userId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  const { id } = await params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ success: false, message: "Invalid booking." }, { status: 400 });
  const month = request.nextUrl.searchParams.get("month") || "";
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return NextResponse.json({ success: false, message: "Invalid calendar month." }, { status: 400 });
  try {
    const data = await AvailabilityModel.getCustomerMonthAvailability(userId, month);
    if (!data || !data.bookings.some((booking) => String(booking.id) === id)) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }
    if (data.error === "SERVICE_UNAVAILABLE") return NextResponse.json({ success: false, message: "One of these services is no longer available for booking." }, { status: 409 });
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load available appointment times." }, { status: 500 });
  }
}
