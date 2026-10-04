import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { readJsonObject } from "../../shared/utils/request";
import { ConsultationBookingModel } from "../../shared/models/consultationBooking";
import _CONSULTATIONS from "../../../../src/json/consultations.json";

function getUserId(request: NextRequest) {
  return decodeUserId(request.cookies.get("user_token")?.value || "");
}

export async function GET(request: NextRequest) {
  const customerId = getUserId(request);
  if (!customerId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  try {
    const data = await ConsultationBookingModel.getCustomerAppointments(customerId);
    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: false, message: "Could not load your consultations." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const customerId = getUserId(request);
  if (!customerId) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  try {
    const body = await readJsonObject(request);
    const offeringId = Number(body.offering_id);
    const slug = typeof body.consultation_slug === "string" ? body.consultation_slug.trim() : "";
    const consultation = _CONSULTATIONS.find(({ id }) => id === slug);
    if (!Number.isSafeInteger(offeringId) || offeringId < 1 || !consultation) {
      return NextResponse.json({ success: false, message: "Choose a valid consultation option." }, { status: 400 });
    }
    const consultationSlugs = [consultation.id, consultation.name.toLowerCase().replace(/\s+/g, "-")];
    const offers = await ConsultationBookingModel.getOffers(consultationSlugs);
    if (!offers.some((offer) => Number(offer.id) === offeringId)) {
      return NextResponse.json({ success: false, message: "That consultation option is no longer available." }, { status: 409 });
    }
    const data = await ConsultationBookingModel.createCustomerAppointment({
      customerId,
      offeringId,
      slugs: consultationSlugs,
      consultationName: consultation.name,
    });
    if (!data) return NextResponse.json({ success: false, message: "That consultation option is no longer available." }, { status: 409 });
    return NextResponse.json({ success: true, data, message: "Consultation added to your bookings." }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, message: "Could not book this consultation." }, { status: 500 });
  }
}
