"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { baseApi } from "../../../api/shared/config";
import useConsultationToggler from "../../../../src/hooks/consultationToggler";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
import _CONSULTATIONS from "../../../../src/json/consultations.json";

const modeNames = { physical: "In person", video: "Video call", audio: "Phone call", chat: "Chat" };

export default function ConsultationDetailPage() {
  const { slug } = useParams();
  const routeSlug = String(slug || "");
  const consultation = useMemo(() => _CONSULTATIONS.find(({ id, name }) =>
    id === routeSlug || name.toLowerCase().replace(/\s+/g, "-") === routeSlug,
  ), [routeSlug]);
  const { activeAppointments, loading: appointmentLoading, isBooked, toggleAppointment } = useConsultationToggler();
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [offerError, setOfferError] = useState("");
  const [busyOfferId, setBusyOfferId] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!consultation) return;
    let mounted = true;
    setLoadingOffers(true);
    baseApi.get(`customers/consultations?slug=${encodeURIComponent(consultation.id)}`)
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.data)) throw new Error(data?.message || "Could not load consultation options.");
        if (mounted) { setOffers(data.data); setOfferError(""); }
      })
      .catch((error) => { if (mounted) setOfferError(error?.response?.data?.message || error.message || "Could not load consultation options."); })
      .finally(() => { if (mounted) setLoadingOffers(false); });
    return () => { mounted = false; };
  }, [consultation]);

  const handleBook = async (offer) => {
    setBusyOfferId(String(offer.id));
    setFeedback("");
    try {
      await toggleAppointment({ offeringId: offer.id, consultationSlug: consultation.id, consultationName: consultation.name });
      setFeedback(isBooked(offer.id) ? "Consultation removed from your bookings." : "Consultation added to your bookings.");
    } catch (error) {
      setFeedback(error.message || "Could not update this consultation.");
    } finally { setBusyOfferId(""); }
  };

  if (!consultation) return <main className="consultation-detail"><div className="consultation-detail-inner"><h1>Consultation not found</h1><Link href="/customer/consultation">Browse consultations</Link></div></main>;

  const hasActiveConsultation = activeAppointments.length > 0;
  return (
    <main className="consultation-detail">
      <div className="consultation-detail-inner">
        <Link className="consultation-back-link" href="/customer/consultation">← All consultations</Link>
        <section className="consultation-detail-hero">
          <div className="consultation-detail-copy">
            <span className="consultation-detail-kicker">PERSONAL GUIDANCE, EXPERT CARE</span>
            <h1>{consultation.name}</h1>
            <p className="consultation-detail-subtitle">{consultation.subtitle}</p>
            <p className="consultation-detail-description">{consultation.description}</p>
          </div>
          <img src={consultation.image || "/consultation.png"} alt="" />
        </section>

        <section className="consultation-offerings" aria-labelledby="consultation-options-title">
          <div className="consultation-offerings-heading">
            <div><span className="consultation-detail-kicker">BOOK A SESSION</span><h2 id="consultation-options-title">Choose an option</h2></div>
            <p>Your appointment time can be arranged together with any services in your bookings.</p>
          </div>
          {loadingOffers || appointmentLoading ? <p className="consultation-state">Loading available options…</p> : null}
          {!loadingOffers && offerError ? <p className="consultation-state is-error" role="alert">{offerError}</p> : null}
          {!loadingOffers && !offerError && offers.length === 0 ? <p className="consultation-state">There are no bookable options for this consultation yet.</p> : null}
          <div className="consultation-offer-list">
            {offers.map((offer) => {
              const booked = isBooked(offer.id);
              return (
                <article className="consultation-offer-card" key={offer.id}>
                  <div><span className="consultation-offer-mode">{modeNames[offer.mode] || offer.mode}</span><h3>{offer.duration_minutes} minute session</h3><p>With a De Skin Culture specialist</p></div>
                  <div className="consultation-offer-action"><strong>₦{Number(offer.price).toLocaleString("en-NG", { maximumFractionDigits: 2 })}</strong><button type="button" disabled={Boolean(busyOfferId)} onClick={() => handleBook(offer)}>{busyOfferId === String(offer.id) ? "Updating…" : booked ? "Remove" : "Add to bookings"}</button></div>
                </article>
              );
            })}
          </div>
          {feedback && <p className="consultation-feedback" role="status" aria-live="polite">{feedback}</p>}
          {hasActiveConsultation && <Link className="consultation-schedule-link" href="/customer/booking">Choose an appointment time <span aria-hidden="true">↗</span></Link>}
        </section>
      </div>
    </main>
  );
}
