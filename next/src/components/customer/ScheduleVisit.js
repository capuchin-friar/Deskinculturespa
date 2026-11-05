"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import { baseApi } from "@/app/api/shared/config";

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
const publicKey = "pk_test_9d54d1840154258f2371f52ac12b73e19b25dada";
const formatPrice = (value) => new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(value) || 0);

const copyByKind = {
  service: {
    kicker: "YOUR VISIT",
    title: "Let's arrange your visit.",
    intro: "Choose one available date and time for the services in this booking.",
    headerNote: "One appointment time will be applied to all active services.",
    empty: "You have no services waiting to be scheduled.",
    emptyLink: { href: "/services", label: "Explore services" },
    summaryEyebrow: "YOUR APPOINTMENT",
    summaryTitle: "Booking summary",
    summaryHeading: "Services",
    sharedNote: "One appointment time applies to every service below.",
    awaiting: "Awaiting appointment time",
    selectedPrefix: "Selected for all",
    noItems: "No services selected.",
    paidRedirect: "We’re saving your appointment and taking you to your bookings.",
    rescheduleRedirect: "Your new appointment time is saved. Taking you to your bookings.",
    redirectHref: "/customer/bookings",
    availabilityPath: "customers/bookings/availability",
    payKind: "booking",
    unit: ["service", "services"],
    arrange: "Arrange all services",
    reschedule: "Reschedule all services",
  },
  consultation: {
    kicker: "YOUR CONSULTATION",
    title: "Let's arrange your consultation.",
    intro: "Choose one available date and time for the consultations in this appointment.",
    headerNote: "One appointment time will be applied to all active consultations.",
    empty: "You have no consultations waiting to be scheduled.",
    emptyLink: { href: "/consultation", label: "Explore consultations" },
    summaryEyebrow: "YOUR CONSULTATION",
    summaryTitle: "Consultation summary",
    summaryHeading: "Consultations",
    sharedNote: "One appointment time applies to every consultation below.",
    awaiting: "Awaiting appointment time",
    selectedPrefix: "Selected for all",
    noItems: "No consultations selected.",
    paidRedirect: "We’re saving your consultation and taking you to your appointments.",
    rescheduleRedirect: "Your new consultation time is saved. Taking you to your appointments.",
    redirectHref: "/customer/appointments",
    availabilityPath: "customers/appointments/availability",
    payKind: "consultation",
    unit: ["consultation", "consultations"],
    arrange: "Arrange all consultations",
    reschedule: "Reschedule all consultations",
  },
  package: {
    kicker: "YOUR PACKAGE",
    title: "Let's arrange your package visit.",
    intro: "Choose one available date and time to start this package.",
    headerNote: "One appointment time will be applied to the packages in this booking.",
    empty: "You have no packages waiting to be scheduled.",
    emptyLink: { href: "/packages", label: "Explore packages" },
    summaryEyebrow: "YOUR PACKAGE",
    summaryTitle: "Package summary",
    summaryHeading: "Packages",
    sharedNote: "One appointment time applies to every package below.",
    awaiting: "Awaiting appointment time",
    selectedPrefix: "Selected for all",
    noItems: "No packages selected.",
    paidRedirect: "We’re saving your package visit and taking you to your packages.",
    rescheduleRedirect: "Your new package visit time is saved. Taking you to your packages.",
    redirectHref: "/customer/packages",
    availabilityPath: "customers/package-bookings/availability",
    payKind: "package",
    unit: ["package", "packages"],
    arrange: "Arrange package visit",
    reschedule: "Reschedule package visit",
  },
};

export default function ScheduleVisit({
  kind = "service",
  items = [],
  loading = false,
  loadError = "",
  onSchedule,
}) {
  const copy = copyByKind[kind] || copyByKind.service;
  const hasItems = items.length > 0;
  const bookingSignature = items.map((item) => `${item.itemKey}:${item.scheduled_at || ""}`).join(",");
  const [month, setMonth] = useState(currentMonth);
  const [availability, setAvailability] = useState(null);
  const [availabilityError, setAvailabilityError] = useState({ scope: "", message: "" });
  const [selection, setSelection] = useState({ scope: "", date: "", slot: "" });
  const [saving, setSaving] = useState(false);
  const [paying, setPaying] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [payer, setPayer] = useState({ email: "", firstName: "", lastName: "", phone: "" });
  const [feedback, setFeedback] = useState("");
  const [availabilityRefresh, setAvailabilityRefresh] = useState(0);
  const selectionScope = `${month}:${bookingSignature}`;
  const selectedDate = selection.scope === selectionScope ? selection.date : "";
  const selectedSlot = selection.scope === selectionScope ? selection.slot : "";
  const shownAvailability = availability?.scope === selectionScope ? availability : null;
  const availabilityErrorMessage = availabilityError.scope === selectionScope ? availabilityError.message : "";
  const availabilityLoading = Boolean(hasItems && !shownAvailability && !availabilityErrorMessage);
  const dates = shownAvailability?.dates || {};
  const slots = selectedDate ? dates[selectedDate] || [] : [];
  const total = items.reduce((sum, item) => sum + Number(item.itemPrice || 0), 0);
  const unpaidTotal = items
    .filter((item) => String(item.payment_status || "pending") !== "paid")
    .reduce((sum, item) => sum + Number(item.itemPrice || 0), 0);
  const needsPayment = unpaidTotal > 0;
  const firstMonth = currentMonth();
  const [year, monthNumber] = month.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const firstWeekday = new Date(Date.UTC(year, monthNumber - 1, 1)).getUTCDay();
  const calendarCells = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => `${month}-${pad(index + 1)}`)];

  const paystackConfig = useMemo(() => ({
    publicKey,
    email: payer.email,
    amount: Math.round(unpaidTotal * 100),
    currency: "NGN",
    firstname: payer.firstName,
    lastname: payer.lastName,
    phone: payer.phone,
    metadata: {
      kind: copy.payKind,
      scheduled_at: selectedSlot || "",
      items: items.map((item) => ({
        item_key: item.itemKey,
        name: item.itemName,
        amount: Number(item.itemPrice || 0),
      })),
      subtotal: unpaidTotal,
    },
  }), [copy.payKind, items, payer, selectedSlot, unpaidTotal]);
  const initializePayment = usePaystackPayment(paystackConfig);

  useEffect(() => {
    let mounted = true;
    baseApi.get("customers/me")
      .then(({ data }) => {
        if (!data?.success || !data.data) return;
        if (mounted) {
          setPayer({
            email: String(data.data.email || "").trim(),
            firstName: String(data.data.fname || "").trim(),
            lastName: String(data.data.lname || "").trim(),
            phone: String(data.data.phone || "").trim(),
          });
        }
      })
      .catch((error) => {
        console.error("Could not load schedule payer details", error);
      });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!hasItems) return;
    let mounted = true;
    baseApi.get(`${copy.availabilityPath}?month=${month}`)
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
  }, [copy.availabilityPath, hasItems, bookingSignature, month, selectionScope, availabilityRefresh]);

  const chooseDate = (date) => {
    setSelection({ scope: selectionScope, date, slot: "" });
    setFeedback("");
  };

  const completeSchedule = async (reference) => {
    setPaying(false);
    setSaving(true);
    setFeedback("");
    try {
      await onSchedule({ scheduledAt: selectedSlot, reference });
      setRedirecting(true);
      window.location.assign(copy.redirectHref);
      return;
    } catch (error) {
      setRedirecting(false);
      setFeedback(error.message || "Could not save this appointment time.");
      setAvailabilityRefresh((value) => value + 1);
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = () => {
    if (!hasItems || !selectedSlot || saving || paying || redirecting) return;
    setFeedback("");
    if (!needsPayment) {
      void completeSchedule();
      return;
    }
    if (!payer.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payer.email)) {
      setFeedback("We need the email on your account to open Paystack. Sign in again and try once more.");
      return;
    }
    setPaying(true);
    initializePayment({
      onSuccess: (response) => {
        const reference = String(response?.reference || "").trim();
        if (!reference) {
          setPaying(false);
          setFeedback("Payment did not return a reference. Your appointment was not saved.");
          return;
        }
        void completeSchedule(reference);
      },
      onClose: () => {
        setPaying(false);
        setFeedback("Payment was cancelled. Your appointment was not saved.");
      },
    });
  };

  if (redirecting) {
    return (
      <main className="booking-page booking-page--paid">
        <div className="booking-paid-card">
          <span className="booking-step">{needsPayment ? "PAYMENT RECEIVED" : "APPOINTMENT UPDATED"}</span>
          <h1>{needsPayment ? "Thank you" : "Your visit is updated"}</h1>
          <p>{needsPayment ? copy.paidRedirect : copy.rescheduleRedirect}</p>
        </div>
      </main>
    );
  }

  const unitLabel = items.length === 1 ? copy.unit[0] : copy.unit[1];

  return (
    <main className="booking-page">
      <div className="booking-intro">
        <span>{copy.kicker}</span>
        <h1>{copy.title}</h1>
        <p>{copy.intro}</p>
      </div>

      <div className="booking-layout">
        <section className="booking-main" aria-label="Appointment calendar and available times">
          <div className="appointment-header">
            <div>
              <span className="booking-step">APPOINTMENT SCHEDULE</span>
              <h2>Choose a date and time</h2>
              <p>{copy.headerNote}</p>
            </div>
            <span className="booking-duration">{items.length} {unitLabel}</span>
          </div>

          {loading && <p className="schedule-state">Loading…</p>}
          {!loading && loadError && <p className="schedule-error" role="alert">{loadError}</p>}
          {!loading && !loadError && !hasItems && (
            <div className="booking-empty">
              <p>{copy.empty}</p>
              <Link href={copy.emptyLink.href}>{copy.emptyLink.label} <span aria-hidden="true">↗</span></Link>
            </div>
          )}

          {!loading && !loadError && hasItems && <>
            <section className="calendar-section" aria-label="Choose appointment date">
              <div className="calendar-heading">
                <div><span className="booking-step">AVAILABLE DATES</span><h3>{formatDate(`${month}-01`, { month: "long", year: "numeric" })}</h3></div>
                <div className="calendar-controls">
                  <button type="button" aria-label="Previous month" disabled={month <= firstMonth || availabilityLoading} onClick={() => { setMonth((value) => shiftMonth(value, -1)); setSelection({ scope: "", date: "", slot: "" }); }}>‹</button>
                  <button type="button" aria-label="Next month" disabled={availabilityLoading} onClick={() => { setMonth((value) => shiftMonth(value, 1)); setSelection({ scope: "", date: "", slot: "" }); }}>›</button>
                </div>
              </div>
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
              <div>
                <span className="booking-step">AVAILABLE TIMES</span>
                <h2>{selectedDate ? formatDate(selectedDate, { weekday: "long", month: "long", day: "numeric" }) : "Select an available date"}</h2>
                {shownAvailability?.timezone && <p>Times shown in {timezoneLabel(shownAvailability.timezone)}.</p>}
              </div>
              {availabilityLoading ? <p className="schedule-state">Checking the team&apos;s availability…</p> : availabilityErrorMessage ? <p className="schedule-error" role="alert">{availabilityErrorMessage}</p> : selectedDate && slots.length === 0 ? <p className="no-slots">No available times remain on this date. Choose another date.</p> : null}
              {slots.length > 0 && <div className="time-list">{slots.map((slot) => <button type="button" key={slot.scheduled_at} className={`time-slot${selectedSlot === slot.scheduled_at ? " selected" : ""}`} aria-pressed={selectedSlot === slot.scheduled_at} onClick={() => { setSelection({ scope: selectionScope, date: selectedDate, slot: slot.scheduled_at }); setFeedback(""); }}>{formatTime(slot.scheduled_at, shownAvailability.timezone)}</button>)}</div>}
              {hasItems && <button type="button" className="appointment-save-button" disabled={!selectedSlot || saving || paying || redirecting} onClick={handleSchedule}>{paying ? "Opening Paystack…" : saving ? "Saving…" : needsPayment ? `Pay ₦${formatPrice(unpaidTotal)} and arrange` : items.every((item) => item.scheduled_at) ? copy.reschedule : copy.arrange}</button>}
              {needsPayment && <p className="booking-payment-note">You will pay with Paystack before this date and time are saved.</p>}
              {feedback && <p className={`appointment-feedback${feedback.toLowerCase().includes("saved") ? "" : " is-error"}`} role="status" aria-live="polite">{feedback}</p>}
            </section>
          </>}
          <p className="booking-contact-note">Appointment times remain requests until confirmed by the team. <Link href="/contact">Contact us</Link> if you need help.</p>
        </section>

        <aside className="booking-summary" aria-labelledby="booking-summary-title">
          <div className="summary-header"><span>{copy.summaryEyebrow}</span><h2 id="booking-summary-title">{copy.summaryTitle}</h2></div>
          <div className="summary-services">
            <h3>{copy.summaryHeading}</h3>
            <p className="summary-shared-slot-note">{copy.sharedNote}</p>
            {items.length ? items.map((item) => (
              <div className="summary-service" key={item.itemKey}>
                <div className="summary-service-top"><strong>{item.itemName}</strong><strong>₦{formatPrice(item.itemPrice)}</strong></div>
                <p>{selectedSlot ? `${copy.selectedPrefix} · ${formatTime(selectedSlot, shownAvailability?.timezone || "Africa/Lagos")}` : item.scheduled_at ? `Scheduled · ${new Date(item.scheduled_at).toLocaleString()}` : copy.awaiting}</p>
              </div>
            )) : <div className="booking-empty"><p>{copy.noItems}</p><Link href={copy.emptyLink.href}>{copy.emptyLink.label} <span aria-hidden="true">↗</span></Link></div>}
          </div>
          <div className="summary-total">
            <div className="total-line"><span>Total</span><strong>₦{formatPrice(total)}</strong></div>
            <p>{needsPayment ? "Pay this total on Paystack to save your appointment time." : `Total for active ${copy.unit[1]}.`}</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
