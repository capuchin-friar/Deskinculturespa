"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { baseApi } from "../../api/shared/config";
import useServiceToggler from "../../../src/hooks/serviceToggler";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const pad = (value) => String(value).padStart(2, "0");
const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
};
const shiftMonth = (month, amount) => {
  const [year, number] = month.split("-").map(Number);
  const date = new Date(Date.UTC(year, number - 1 + amount, 1));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;
};
const formatDate = (date, options) => new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, { ...options, timeZone: "UTC" });
const formatTime = (value, timezone) => new Date(value).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit", timeZone: timezone });
const timezoneLabel = (timezone) => ({ "Africa/Lagos": "West Africa Time (GMT+1)", UTC: "UTC", "Europe/London": "London time", "America/New_York": "New York time" }[timezone] || timezone);

export default function BookingPage() {
  const { bookings, loading, loadError, scheduleBookings } = useServiceToggler();
  const activeBookings = useMemo(() => bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status)), [bookings]);
  const hasActiveBookings = activeBookings.length > 0;
  const bookingSignature = activeBookings.map((booking) => `${booking.id}:${booking.service_id}:${booking.scheduled_at || ""}`).join(",");
  const [month, setMonth] = useState(currentMonth);
  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState({ scope: "", message: "" });
  const [selection, setSelection] = useState({ scope: "", date: "", slot: "" });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0);
  const selectionScope = `${month}:${bookingSignature}`;
  const selectedDate = selection.scope === selectionScope ? selection.date : "";
  const selectedSlot = selection.scope === selectionScope ? selection.slot : "";
  const shownAvailability = availability?.scope === selectionScope ? availability : null;
  const availabilityErrorMessage = availabilityError.scope === selectionScope ? availabilityError.message : "";
  const availabilityLoading = Boolean(hasActiveBookings && !shownAvailability && !availabilityErrorMessage);
  const dates = shownAvailability?.dates || {};
  const slots = selectedDate ? dates[selectedDate] || [] : [];
  const total = activeBookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);
  const firstMonth = currentMonth();
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const calendarCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => `${month}-${pad(index + 1)}`)];

  useEffect(() => {
    if (!hasActiveBookings) return;
    let mounted = true;
    baseApi.get(`customers/bookings/availability?month=${month}`)
      .then(({ data }) => {
        if (!data?.success || !data.data) throw new Error(data?.message || "Could not load available appointment times.");
        if (mounted) {
          setAvailability({ ...data.data, scope: selectionScope });
          setAvailabilityError({ scope: "", message: "" });
        }
      })
      .catch((error) => {
        if (mounted) setAvailabilityError({ scope: selectionScope, message: error?.response?.data?.message || error.message || "Could not load availability." });
      });
    return () => { mounted = false; };
  }, [hasActiveBookings, bookingSignature, month, selectionScope, availabilityRefresh]);

  const chooseDate = (date) => {
    setSelection({ scope: selectionScope, date, slot: "" });
    setFeedback("");
  };

  const handleSchedule = async () => {
    if (!activeBookings.length || !selectedSlot) return;
    setSaving(true);
    setFeedback("");
    try {
      await scheduleBookings({ scheduledAt: selectedSlot });
      setFeedback("The same appointment time was saved for all services.");
    } catch (error) {
      setFeedback(error.message || "Could not schedule all services.");
      setAvailabilityRefresh((value) => value + 1);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="booking-page">
      <div className="booking-intro">
        <span>YOUR VISIT</span>
        <h1>Let&apos;s arrange your visit.</h1>
      <p>Choose one available date and time for all services in your booking.</p>
      </div>

      <div className="booking-layout">
        <section className="booking-main" aria-label="Appointment calendar and available times">
          <div className="appointment-header">
            <div><span className="booking-step">APPOINTMENT SCHEDULE</span><h2>Choose a date and time</h2>
              <p>One appointment time will be applied to every active service.</p></div>
            <span className="booking-duration">{activeBookings.length} {activeBookings.length === 1 ? "service" : "services"}</span>
          </div>

          {loading && <p className="schedule-state">Loading your bookings…</p>}
          {!loading && loadError && <p className="schedule-error" role="alert">{loadError}</p>}
          {!loading && !loadError && activeBookings.length === 0 && <div className="booking-empty"><p>You have no services waiting to be scheduled.</p><Link href="/customer/services">Explore services <span aria-hidden="true">↗</span></Link></div>}

          {!loading && activeBookings.length > 0 && <>
            <section className="calendar-section" aria-label="Choose appointment date">
              <div className="calendar-heading"><div><span className="booking-step">AVAILABLE DATES</span><h3>{formatDate(`${month}-01`, { month: "long", year: "numeric" })}</h3></div>
                <div className="calendar-controls"><button type="button" aria-label="Previous month" disabled={month <= firstMonth || availabilityLoading} onClick={() => { setMonth((value) => shiftMonth(value, -1)); setSelection({ scope: "", date: "", slot: "" }); }}>‹</button><button type="button" aria-label="Next month" disabled={availabilityLoading} onClick={() => { setMonth((value) => shiftMonth(value, 1)); setSelection({ scope: "", date: "", slot: "" }); }}>›</button></div></div>
              <div className="calendar-grid calendar-weekdays" aria-hidden="true">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
              <div className="calendar-grid calendar-days">
                {calendarCells.map((date, index) => {
                  if (!date) return <span className="calendar-blank" key={`blank-${index}`} />;
                  const configured = Object.prototype.hasOwnProperty.call(dates, date);
                  const available = Array.isArray(dates[date]) && dates[date].length > 0;
                  const full = configured && !available;
                  const chosen = selectedDate === date;
                  return <button key={date} type="button" className={`calendar-day${available ? " is-available" : ""}${full ? " is-full" : ""}${chosen ? " is-selected" : ""}`} disabled={!available || availabilityLoading} aria-pressed={chosen} title={full ? "Fully booked" : undefined} aria-label={`${formatDate(date, { weekday: "long", month: "long", day: "numeric" })}${available ? ", available" : full ? ", fully booked" : ", unavailable"}`} onClick={() => chooseDate(date)}>{Number(date.slice(-2))}</button>;
                })}
              </div>
              <div className="calendar-legend"><span><i className="available-dot" />Available</span><span><i className="full-dot" />Fully booked</span><span><i className="unavailable-dot" />Unavailable</span></div>
              {!availabilityLoading && shownAvailability && Object.keys(dates).length === 0 && <p className="no-slots">There are no upcoming availability windows this month.</p>}
            </section>

            <section className="time-section" aria-label="Available appointment times">
              <div><span className="booking-step">AVAILABLE TIMES</span><h2>{selectedDate ? formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" }) : "Select an available date"}</h2>
                {shownAvailability?.timezone && <p>Times shown in {timezoneLabel(shownAvailability.timezone)}.</p>}</div>
              {availabilityLoading ? <p className="schedule-state">Checking the team&apos;s availability…</p> : availabilityErrorMessage ? <p className="schedule-error" role="alert">{availabilityErrorMessage}</p> : selectedDate && slots.length === 0 ? <p className="no-slots">No available times remain on this date. Choose another date.</p> : null}
              {slots.length > 0 && <div className="time-list">{slots.map((slot) => <button type="button" key={slot.scheduled_at} className={`time-slot${selectedSlot === slot.scheduled_at ? " selected" : ""}`} aria-pressed={selectedSlot === slot.scheduled_at} onClick={() => { setSelection({ scope: selectionScope, date: selectedDate, slot: slot.scheduled_at }); setFeedback(""); }}>{formatTime(slot.scheduled_at, shownAvailability.timezone)}</button>)}</div>}
              {activeBookings.length > 0 && <button type="button" className="appointment-save-button" disabled={!selectedSlot || saving} onClick={handleSchedule}>{saving ? "Saving…" : activeBookings.every((booking) => booking.scheduled_at) ? "Reschedule all services" : "Arrange all services"}</button>}
              {feedback && <p className={`appointment-feedback${feedback.toLowerCase().includes("saved") ? "" : " is-error"}`} role="status" aria-live="polite">{feedback}</p>}
            </section>
          </>}
          <p className="booking-contact-note">Appointment times remain requests until confirmed by the team. <Link href="/customer/contact">Contact us</Link> if you need help.</p>
        </section>

        <aside className="booking-summary" aria-labelledby="booking-summary-title">
          <div className="summary-header"><span>YOUR APPOINTMENT</span><h2 id="booking-summary-title">Booking summary</h2></div>
          <div className="summary-services"><h3>Services</h3><p className="summary-shared-slot-note">One appointment time applies to every service below.</p>
            {activeBookings.length ? activeBookings.map((booking) => <div className="summary-service" key={booking.id}>
              <span className="summary-service-top"><strong>{booking.subcategory || booking.category || "Service"}</strong><strong>₦{Number(booking.price || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}</strong></span>
              <span>{selectedSlot ? `Selected for all · ${formatTime(selectedSlot, shownAvailability?.timezone || "Africa/Lagos")}` : booking.scheduled_at ? `Scheduled · ${new Date(booking.scheduled_at).toLocaleString()}` : "Awaiting shared appointment time"}</span>
            </div>) : <div className="booking-empty"><p>No services selected.</p><Link href="/customer/services">Explore services <span aria-hidden="true">↗</span></Link></div>}
          </div>
          <div className="summary-total"><div className="total-line"><span>Total</span><strong>₦{total.toLocaleString("en-NG", { maximumFractionDigits: 2 })}</strong></div><p>Total shown for active service bookings.</p></div>
        </aside>
      </div>
    </main>
  );
}
