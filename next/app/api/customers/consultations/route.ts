import { NextRequest, NextResponse } from "next/server";
import { ConsultationBookingModel } from "../../shared/models/consultationBooking";
import _CONSULTATIONS from "../../../../src/json/consultations.json";
import { resolveAppointmentType } from "@/src/utils/appointmentTypes";

export async function GET(request: NextRequest) {
  const routeSlug = request.nextUrl.searchParams.get("slug")?.trim();

  try {
    const offers = await ConsultationBookingModel.getActiveOffers();

    if (!routeSlug) {
      const types = _CONSULTATIONS.map((consultation) => ({
        ...consultation,
        offers: offers.filter((offer) => offer.type === consultation.id),
      }));
      return NextResponse.json({ success: true, data: types });
    }

    const consultation = resolveAppointmentType(routeSlug) || _CONSULTATIONS.find(
      ({ id, name }) => id === routeSlug || name.toLowerCase().replace(/\s+/g, "-") === routeSlug,
    );
    if (!consultation) {
      return NextResponse.json({ success: false, message: "Choose a valid consultation." }, { status: 400 });
    }

    const typeId = "id" in consultation ? consultation.id : resolveAppointmentType(routeSlug)?.id;
    const data = offers.filter((offer) => offer.type === typeId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load consultation options." }, { status: 500 });
  }
}
