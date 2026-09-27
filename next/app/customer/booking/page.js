"use client";

import { useState } from "react";
import "./styles/xxl.css";
import { useSelector } from "react-redux";

const dates = [
  { day: "18", weekday: "Fri", month: "Sep" },
  { day: "19", weekday: "Sat", month: "Sep" },
  { day: "20", weekday: "Sun", month: "Sep" },
  { day: "21", weekday: "Mon", month: "Sep" },
  { day: "22", weekday: "Tue", month: "Sep" },
  { day: "23", weekday: "Wed", month: "Sep" },
  { day: "24", weekday: "Thu", month: "Sep" },
  { day: "25", weekday: "Fri", month: "Sep" },
  { day: "26", weekday: "Sat", month: "Sep" },
  { day: "27", weekday: "Sun", month: "Sep" },
  { day: "28", weekday: "Mon", month: "Sep" },
];

const timeSlots = [
  "10:00 AM",
  "10:15 AM",
  "10:30 AM",
  "10:45 AM",
  "11:00 AM",
  "11:15 AM",
  "11:30 AM",
  "11:45 AM",
  "12:00 PM",
];

const services = [
  {
    id: 1,
    name: "Deluxe Pedicure",
    duration: "1hr 15min",
    price: 17000,
    professional: "Chisom",
  },
  {
    id: 2,
    name: "Ionic Foot Detox",
    duration: "20min",
    price: 15000,
    professional: "Chisom",
  },
];

function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />

      <path
        d="M8 3V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M16 3V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path d="M3 10H21" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.7" />

      <path
        d="M12 7V12L15 14"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M15 18L9 12L15 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 18L15 12L9 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M4 7H20"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M9 7V4H15V7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M6 7L7 20H17L18 7"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />

      <path
        d="M10 11V16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />

      <path
        d="M14 11V16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function BookingPage() {
  const [selectedDate, setSelectedDate] = useState("19");
  const [selectedTime, setSelectedTime] = useState("10:15 AM");

  const { service: services } = useSelector((s) => s.service);

  const total = services.reduce((sum, service) => sum + service.price, 0);

  return (
    <div className="booking-page">
      <div className="booking-layout">
        {/* ======================================
            LEFT
        ====================================== */}

        <section className="booking-main">
          {/* Header */}
          <div className="appointment-header">
            <div>
              <h1>Appointment Summary</h1>

              <p>
                {services.length} services
                {" • "}
                1hr 35min
                {" • "}₦{total.toLocaleString()}
              </p>
            </div>

            <div className="professional-selection">
              <span>With</span>

              <button type="button">
                Chisom Okike
                <span className="professional-arrow">↪</span>
              </button>
            </div>
          </div>

          {/* ==================================
              DATE SECTION
          ================================== */}

          <div className="date-section">
            <div className="date-header">
              <h2>Sat September 2026</h2>

              <div className="date-navigation">
                <button type="button">
                  <ArrowLeftIcon />
                </button>

                <button type="button">
                  <ArrowRightIcon />
                </button>
              </div>
            </div>

            <div className="date-list">
              {dates.map((date) => (
                <button
                  type="button"
                  key={date.day}
                  className={`date-item ${
                    selectedDate === date.day ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDate(date.day)}
                >
                  <span className="date-number">{date.day}</span>

                  <span className="date-weekday">{date.weekday}</span>

                  <span className="date-month">{date.month}</span>
                </button>
              ))}
            </div>

            <div className="timezone">West Africa Time (GMT+1)</div>
          </div>

          {/* ==================================
              TIME
          ================================== */}

          <div className="time-section">
            <h2>Select time</h2>

            <div className="time-list">
              {timeSlots.map((time) => (
                <button
                  type="button"
                  key={time}
                  className={`time-slot ${
                    selectedTime === time ? "selected" : ""
                  }`}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ======================================
            RIGHT SUMMARY
        ====================================== */}

        <aside className="booking-summary">
          <div className="summary-header">Booking summary</div>

          {/* Date + Time */}

          <div className="summary-date">
            <div className="summary-info">
              <CalendarIcon />

              <span>Saturday, September 19, 2026</span>
            </div>

            <div className="summary-info">
              <ClockIcon />

              <span>{selectedTime}</span>
            </div>
          </div>

          {/* Services */}

          <div className="summary-services">
            <h3>Services</h3>

            {services.map((service) => (
              <div className="summary-service" key={service.id}>
                <div className="summary-service-top">
                  <strong>{service.name ?? service.subcategory}</strong>

                  <div className="summary-service-price">
                    <strong>
                      ₦
                      {Number(service.price).toLocaleString("en-NG", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>

                    <button
                      type="button"
                      aria-label={`Remove ${service.name ?? service.subcategory}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>

                <p>
                  {service.duration ?? service.duration_munites} with{" "}
                  <span>{service.professional ?? "_"}</span>
                </p>
              </div>
            ))}
          </div>

          {/* Total */}

          <div className="summary-total">
            <div className="total-line">
              <strong>Total</strong>

              <strong>₦{total.toLocaleString()}</strong>
            </div>

            <p>+ processing fee (based on payment method)</p>

            <p>Total duration: 1hr 35min</p>
          </div>

          {/* Continue */}

          <button type="button" className="continue-button">
            Continue to payment
          </button>
        </aside>
      </div>
    </div>
  );
}
