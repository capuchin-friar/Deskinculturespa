import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { PackageBookingModel } from "../../../shared/models/packageBooking";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user_id = decodeUserId(request.cookies.get("user_token")?.value || "");
  if (!user_id) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  const { id } = await params;
  if (!/^\d+$/.test(id)) {
    return NextResponse.json({ success: false, message: "Invalid package booking." }, { status: 400 });
  }
  try {
    const deleted = await PackageBookingModel.deletePackageBookingDoc({ id, user_id });
    if (!deleted) {
      return NextResponse.json({ success: false, message: "This package booking cannot be removed." }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Package removed from your bookings." });
  } catch {
    return NextResponse.json({ success: false, message: "Could not remove this package." }, { status: 500 });
  }
}
