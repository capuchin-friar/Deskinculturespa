"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import "./styles/xxl.css";

const dates = [
  { day: "25", weekday: "Fri", month: "Sep" },
  { day: "26", weekday: "Sat", month: "Sep" },
  { day: "27", weekday: "Sun", month: "Sep" },
  { day: "28", weekday: "Mon", month: "Sep" },
  { day: "29", weekday: "Tue", month: "Sep" },
  { day: "30", weekday: "Wed", month: "Sep" },
  { day: "01", weekday: "Thu", month: "Oct" },
];

const timeSlots = [
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
];

function parseTime(time) {
  const [clock, period] = time.split(" ");
  let [hours, minutes] = clock.split(":").map(Number);
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours * 60 + minutes;
}

function formatDateTime(day, month, minutes) {
  const monthIndex = month === "Oct" ? 9 : 8;
  const date = new Date(2026, monthIndex, Number(day));
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.toISOString();
}

export default function BookingPage() {
  const { service: services } = useSelector((state) => state.service);
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [selectedTime, setSelectedTime] = useState(timeSlots[0]);
  const [loading, setLoading] = useState(false);

  const total = services.reduce((sum, service) => sum + Number(service.price), 0);

  async function checkout() {
    if (!services.length || loading) return;
    setLoading(true);

    try {
      let cursor = parseTime(selectedTime);
      const items = services.map((service) => {
        const scheduledAt = formatDateTime(selectedDate.day, selectedDate.month, cursor);
        cursor += Number(service.duration_minutes || 60);
        return { service_id: Number(service.id), scheduled_at: scheduledAt };
      });

      const response = await fetch("/api/checkout/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.data || payload.message || "Unable to initialize service checkout");
      }

      window.location.assign(payload.data.authorization_url);
    } catch (error) {
      alert(error.message || "Unable to initialize payment");
      setLoading(false);
    }
  }

  return (
    <div className="booking-page">
      <div className="booking-layout">
        <section className="booking-main">
          <div className="appointment-header">
            <div>
              <h1>Service booking</h1>
              <p>{services.length} service{services.length === 1 ? "" : "s"} • ₦{total.toLocaleString("en-NG")}</p>
            </div>
          </div>

          <div className="date-section">
            <div className="date-header"><h2>Select date</h2></div>
            <div className="date-list">
              {dates.map((date) => (
                <button
                  type="button"
                  key={`${date.month}-${date.day}`}
                  className={`date-item ${selectedDate.day === date.day && selectedDate.month === date.month ? "selected" : ""}`}
                  onClick={() => setSelectedDate(date)}
                >
                  <span className="date-number">{date.day}</span>
                  <span className="date-weekday">{date.weekday}</span>
                  <span className="date-month">{date.month}</span>
                </button>
              ))}
            </div>
            <div className="timezone">West Africa Time (GMT+1)</div>
          </div>

          <div className="time-section">
            <h2>Select time</h2>
            <div className="time-list">
              {timeSlots.map((time) => (
                <button
                  type="button"
                  key={time}
                  className={`time-slot ${selectedTime === time ? "selected" : ""}`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="booking-summary">
          <div className="summary-header">Booking summary</div>
          <div className="summary-services">
            {services.map((service) => (
              <div className="summary-service" key={service.id}>
                <div className="summary-service-top">
                  <strong>{service.title ?? service.subcategory}</strong>
                  <strong>₦{Number(service.price).toLocaleString("en-NG")}</strong>
                </div>
                <p>{service.duration_minutes || 60} minutes</p>
              </div>
            ))}
          </div>

          <div className="summary-total">
            <div className="total-line">
              <strong>Total</strong>
              <strong>₦{total.toLocaleString("en-NG")}</strong>
            </div>
            <p>Payment is confirmed by the server after Paystack verification.</p>
          </div>

          <button type="button" className="continue-button" onClick={checkout} disabled={loading || !services.length}>
            {loading ? "Processing..." : "Continue to payment"}
          </button>
        </aside>
      </div>
    </div>
  );
}
