import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { ConsultationBookingModel } from "../../../shared/models/consultationBooking";

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const customerId = decodeUserId(request.cookies.get("user_token")?.value || "");
  if (!customerId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  if (!/^\d+$/.test(id)) return NextResponse.json({ success: false, message: "Invalid appointment." }, { status: 400 });
  try {
    const deleted = await ConsultationBookingModel.deleteCustomerAppointment(id, customerId);
    if (!deleted) return NextResponse.json({ success: false, message: "This consultation cannot be removed." }, { status: 404 });
    return NextResponse.json({ success: true, message: "Consultation removed from your bookings." });
  } catch {
    return NextResponse.json({ success: false, message: "Could not remove this consultation." }, { status: 500 });
  }
}
