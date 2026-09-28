"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

export default function BookingPage() {
  const services = useSelector((state) => state.service?.service ?? []);
  const total = services.reduce((sum, service) => sum + Number(service.price || 0), 0);

  return (
    <main className="booking-page">
      <div className="booking-intro">
        <span>YOUR VISIT</span>
        <h1>Let&apos;s arrange your visit.</h1>
        <p>Review your selected services and contact the team to arrange an appointment.</p>
      </div>
      <div className="booking-layout">
        <section className="booking-main" aria-label="Appointment schedule information">
          <div className="appointment-header">
            <div><span className="booking-step">APPOINTMENT SCHEDULE</span><h2>Availability by request</h2><p>Contact the team to arrange a date and time for your visit.</p></div>
            <span className="booking-duration">{services.length} {services.length === 1 ? "service" : "services"}</span>
          </div>
          <div className="time-section">
            <div className="booking-availability" role="status">
              <span className="booking-availability-mark" aria-hidden="true">✳</span>
              <div><h3>Let&apos;s find a time for you.</h3><p>Appointment times aren&apos;t listed online right now. Get in touch and we&apos;ll help arrange your visit.</p><Link href="/customer/contact">Contact De Skin Culture <span aria-hidden="true">↗</span></Link></div>
            </div>
          </div>
        </section>

        <aside className="booking-summary" aria-labelledby="booking-summary-title">
          <div className="summary-header"><span>YOUR APPOINTMENT</span><h2 id="booking-summary-title">Booking summary</h2></div>
          <div className="summary-date">
            <div className="summary-info"><span className="summary-schedule-note">Date and time to be arranged with the team.</span></div>
          </div>
          <div className="summary-services"><h3>Selected services</h3>
            {services.length ? services.map((service) => <div className="summary-service" key={service.id}>
              <div className="summary-service-top"><strong>{service.name ?? service.subcategory}</strong><strong>₦{Number(service.price || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}</strong></div>
              <p>{service.duration ?? service.duration_munites}{service.professional ? ` · ${service.professional}` : ""}</p>
            </div>) : <div className="booking-empty"><p>Your booking has no services yet.</p><Link href="/customer/services">Explore services <span aria-hidden="true">↗</span></Link></div>}
          </div>
          <div className="summary-total"><div className="total-line"><span>Total</span><strong>₦{total.toLocaleString("en-NG", { maximumFractionDigits: 2 })}</strong></div>{services.length > 0 && <p>Total shown for selected services.</p>}</div>
          <button type="button" className="continue-button" disabled>Continue to payment <span aria-hidden="true">→</span></button>
        </aside>
      </div>
    </main>
  );
}
