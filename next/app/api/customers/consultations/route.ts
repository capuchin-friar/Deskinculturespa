import { NextRequest, NextResponse } from "next/server";
import { ConsultationBookingModel } from "../../shared/models/consultationBooking";
import _CONSULTATIONS from "../../../../src/json/consultations.json";

export async function GET(request: NextRequest) {
  const routeSlug = request.nextUrl.searchParams.get("slug")?.trim();
  const consultation = _CONSULTATIONS.find(({ id, name }) => id === routeSlug || name.toLowerCase().replace(/\s+/g, "-") === routeSlug);
  if (!consultation) {
    return NextResponse.json({ success: false, message: "Choose a valid consultation." }, { status: 400 });
  }
  try {
    const data = await ConsultationBookingModel.getOffers([consultation.id, consultation.name.toLowerCase().replace(/\s+/g, "-")]);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load consultation options." }, { status: 500 });
  }
}
