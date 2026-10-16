"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  FiBookmark,
  FiCalendar,
  FiClock,
  FiCreditCard,
  FiDollarSign,
  FiEdit3,
  FiHeadphones,
  FiMapPin,
  FiPackage,
  FiUser,
  FiVideo,
} from "react-icons/fi";
import "./styles/laptop.css";
import "./styles/appointments.css";
import "./styles/bookings.css";
import "./styles/account.css";

const sampleAccount = {
  name: "Amara Okafor",
  email: "amara.okafor@example.com",
  address: [
    "Amara Okafor",
    "18 Palm Avenue",
    "Independence Layout",
    "Enugu, Enugu State",
    "+234 800 000 0000",
  ],
  storeCredit: 0,
};

const sampleAppointments = [
  {
    id: 481,
    customer_id: 102,
    consultant_id: 14,
    offering_id: 6,
    consultation_name: "Skincare Consultation",
    appointment_date: "2026-10-20",
    start_time: "10:00:00",
    end_time: "10:45:00",
    scheduled_at: "2026-10-20T09:00:00.000Z",
    amount: "25000.00",
    status: "confirmed",
    payment_status: "paid",
    notes: "Discuss sensitive skin and a simple daily routine.",
    mode: "video",
    duration_minutes: 45,
  },
  {
    id: 482,
    customer_id: 102,
    consultant_id: 14,
    offering_id: 9,
    consultation_name: "Body Treatment Consultation",
    appointment_date: null,
    start_time: null,
    end_time: null,
    scheduled_at: null,
    amount: "18000.00",
    status: "pending",
    payment_status: "pending",
    notes: null,
    mode: "physical",
    duration_minutes: 30,
  },
  {
    id: 456,
    customer_id: 102,
    consultant_id: 14,
    offering_id: 6,
    consultation_name: "Skincare Consultation",
    appointment_date: "2026-09-18",
    start_time: "13:00:00",
    end_time: "13:45:00",
    scheduled_at: "2026-09-18T12:00:00.000Z",
    amount: "25000.00",
    status: "completed",
    payment_status: "paid",
    notes: "Follow-up consultation.",
    mode: "video",
    duration_minutes: 45,
  },
];

const sampleBookings = [
  {
    id: 730,
    user_id: 102,
    service_id: 21,
    scheduled_at: "2026-10-22T10:00:00.000Z",
    price: "35000.00",
    status: "confirmed",
    payment_status: "paid",
    notes: "Please focus on hydration.",
    category: "Facial Treatment",
    subcategory: "Hydrating Facial",
    description: "A nourishing facial treatment to refresh and hydrate the skin.",
    duration_minutes: 60,
    image_url: null,
  },
  {
    id: 731,
    user_id: 102,
    service_id: 24,
    scheduled_at: null,
    price: "22000.00",
    status: "pending",
    payment_status: "pending",
    notes: null,
    category: "Body Care",
    subcategory: "Body Polish",
    description: "A gentle exfoliating treatment for softer, smoother skin.",
    duration_minutes: 45,
    image_url: null,
  },
  {
    id: 704,
    user_id: 102,
    service_id: 18,
    scheduled_at: "2026-09-12T11:00:00.000Z",
    price: "28000.00",
    status: "completed",
    payment_status: "paid",
    notes: "Thank you for the great service.",
    category: "Facial Treatment",
    subcategory: "Brightening Facial",
    description: "A facial treatment focused on a brighter, more even-looking complexion.",
    duration_minutes: 50,
    image_url: null,
  },
];

export default function Page() {
  const params = useParams();
  const section = Array.isArray(params?.id) ? params.id[0] : params?.id;

  useEffect(() => {
    const customerMain = document.querySelector(".customer-main");
    if (customerMain) customerMain.style.background = "#f9f9f9";
  }, []);

  return (
    <div className="customer-account-page">
      <Aside section={section} />
      {section === "appointments" ? (
        <Appointments />
      ) : section === "bookings" ? (
        <Bookings />
      ) : section === "account" ? (
        <AccountOverview />
      ) : (
        <Orders />
      )}
    </div>
  );
}

function Aside({ section }) {
  return (
    <aside className="customer-account-nav" aria-label="Account navigation">
      <Link
        href="/customer/account"
        aria-current={section === "account" ? "page" : undefined}
      >
        <FiUser aria-hidden="true" />
        My Account
      </Link>
      <hr />
      {[
        { name: "Appointments", id: "appointments", Icon: FiCalendar },
        { name: "Bookings", id: "bookings", Icon: FiBookmark },
        { name: "Orders", id: "orders", Icon: FiPackage },
      ].map((o, i) => {
        const Icon = o.Icon;
        return (
          <Link
            href={`/customer/${o.id}`}
            key={i}
            aria-current={section === o.id ? "page" : undefined}
          >
            <Icon aria-hidden="true" />
            {o.name}
          </Link>
        );
      })}
    </aside>
  );
}

function Orders() {
  const [activeTab, setActiveTab] = useState("active");
  const orders = {
    active: [
      {
        id: "1339383626",
        title:
          "PRO LED 600 + 2 BATTERIES + CHARGER DOCK + CABLE +2.1m Stand + Remote",
        quantity: 2,
        status: "Shipped",
        delivery: "Delivered between Friday 16 October and Monday 19 October",
        color: "blue",
        details: "Your order has been shipped and is on its way.",
      },
      {
        id: "1339383626",
        title: "Lightweight Portable Tripod Stand With Remote Control",
        quantity: 1,
        status: "Shipped",
        delivery: "Delivered between Friday 16 October and Monday 19 October",
        color: "blue",
        details: "Your order has been shipped and is on its way.",
      },
      {
        id: "1964494446",
        title: "Rubik’s Cube 3by3 Puzzle Cube 3 X 3 Speed Cube - Multi",
        variation: "…",
        status: "Delivered",
        delivery: "On 22-04",
        color: "green",
        details: "This order was delivered successfully.",
      },
    ],
    archived: [
      {
        id: "1964494447",
        title: "LED Desk Lamp with Adjustable Stand",
        quantity: 1,
        status: "Returned",
        delivery: "Return completed",
        color: "gray",
        details: "Your return has been completed.",
      },
      {
        id: "1964494448",
        title: "Portable Phone Tripod With Remote",
        quantity: 1,
        status: "Cancelled",
        delivery: "Cancelled on 12 October",
        color: "gray",
        details: "This order was cancelled.",
      },
    ],
  };
  const currentOrders = orders[activeTab];

  return (
    <section
      className="customer-orders"
      aria-labelledby="customer-orders-title"
    >
      <header className="customer-orders__header">
        <h1 id="customer-orders-title">Orders</h1>
      </header>

      <div className="customer-orders__content">
        <div
          className="customer-orders__tabs"
          role="tablist"
          aria-label="Order status"
        >
          <button
            type="button"
            id="orders-tab-active"
            className={`customer-orders__tab${activeTab === "active" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "active"}
            aria-controls="orders-panel"
            onClick={() => setActiveTab("active")}
          >
            Ongoing/Delivered <span>(11)</span>
          </button>
          <button
            type="button"
            id="orders-tab-archived"
            className={`customer-orders__tab${activeTab === "archived" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "archived"}
            aria-controls="orders-panel"
            onClick={() => setActiveTab("archived")}
          >
            Canceled/Returned <span>(22)</span>
          </button>
        </div>

        <div
          className="customer-orders__list"
          id="orders-panel"
          role="tabpanel"
          aria-labelledby={
            activeTab === "active" ? "orders-tab-active" : "orders-tab-archived"
          }
        >
          {currentOrders.map((order, index) => (
            <article className="customer-order" key={`${order.id}-${index}`}>
              <div className="customer-order__image" aria-hidden="true">
                <FiPackage />
              </div>
              <div className="customer-order__main">
                <h2 className="customer-order__title">{order.title}</h2>
                <p className="customer-order__id">Order {order.id}</p>
                {order.quantity ? (
                  <p className="customer-order__meta">Qty: {order.quantity}</p>
                ) : null}
                {order.variation ? (
                  <p className="customer-order__meta">
                    Variation: {order.variation}
                  </p>
                ) : null}
                <span
                  className={`customer-order__status customer-order__status--${order.color}`}
                >
                  {order.status}
                </span>
                <p className="customer-order__delivery">{order.delivery}</p>
              </div>
              <details className="customer-order__details">
                <summary>See details</summary>
                <div className="customer-order__details-content">
                  <p>{order.details}</p>
                  <p>
                    Order number: <strong>{order.id}</strong>
                  </p>
                </div>
              </details>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function Appointments() {
  const appointments = sampleAppointments;
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcoming = appointments.filter((appointment) =>
    ["pending", "confirmed"].includes(String(appointment.status).toLowerCase()),
  );
  const past = appointments.filter(
    (appointment) =>
      !["pending", "confirmed"].includes(String(appointment.status).toLowerCase()),
  );
  const shownAppointments = activeTab === "upcoming" ? upcoming : past;

  return (
    <section
      className="customer-appointments"
      aria-labelledby="customer-appointments-title"
    >
      <header className="customer-appointments__header">
        <h1 id="customer-appointments-title">Appointments</h1>
        <p>Review your consultation appointments and their details.</p>
      </header>
      <div className="customer-appointments__content">
        <div
          className="customer-appointments__tabs"
          role="tablist"
          aria-label="Appointment status"
        >
          <button
            type="button"
            id="appointments-tab-upcoming"
            className={`customer-appointments__tab${activeTab === "upcoming" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "upcoming"}
            aria-controls="appointments-panel"
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming <span>({upcoming.length})</span>
          </button>
          <button
            type="button"
            id="appointments-tab-past"
            className={`customer-appointments__tab${activeTab === "past" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "past"}
            aria-controls="appointments-panel"
            onClick={() => setActiveTab("past")}
          >
            Past <span>({past.length})</span>
          </button>
        </div>
        <div
          className="customer-appointments__list"
          id="appointments-panel"
          role="tabpanel"
          aria-labelledby={`appointments-tab-${activeTab}`}
        >
          {shownAppointments.length === 0 ? (
            <p className="customer-appointments__message">
              {activeTab === "upcoming"
                ? "You don’t have any upcoming appointments."
                : "No past appointments to show."}
            </p>
          ) : (
            shownAppointments.map((appointment) => {
              const appointmentDate = appointment.scheduled_at
                ? new Date(appointment.scheduled_at)
                : null;
              const validDate =
                appointmentDate && !Number.isNaN(appointmentDate.getTime());
              const status = String(appointment.status || "pending");
              const mode = String(appointment.mode || "consultation");
              const ModeIcon =
                mode.toLowerCase() === "video"
                  ? FiVideo
                  : mode.toLowerCase() === "audio"
                    ? FiHeadphones
                    : FiMapPin;

              return (
                <article
                  className="customer-appointment"
                  key={appointment.id}
                >
                  <div className="customer-appointment__icon" aria-hidden="true">
                    <FiCalendar />
                  </div>
                  <div className="customer-appointment__main">
                    <h2 className="customer-appointment__title">
                      {appointment.consultation_name || "Consultation"}
                    </h2>
                    <p className="customer-appointment__id">
                      Appointment #{appointment.id}
                    </p>
                    <div className="customer-appointment__facts">
                      <span>
                        <ModeIcon aria-hidden="true" />
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </span>
                      <span>
                        <FiClock aria-hidden="true" />
                        {appointment.duration_minutes
                          ? `${appointment.duration_minutes} minutes`
                          : "Duration not set"}
                      </span>
                      <span>
                        <FiDollarSign aria-hidden="true" />
                        {formatCustomerPrice(appointment.amount)}
                      </span>
                      <span>
                        <FiCreditCard aria-hidden="true" />
                        {formatStatus(appointment.payment_status)}
                      </span>
                    </div>
                    <span
                      className={`customer-appointment__status customer-appointment__status--${status.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    >
                      {formatStatus(status)}
                    </span>
                    <p className="customer-appointment__date">
                      {validDate
                        ? appointmentDate.toLocaleString(undefined, {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Appointment time not scheduled"}
                    </p>
                  </div>
                  <details className="customer-appointment__details">
                    <summary>See details</summary>
                    <div className="customer-appointment__details-content">
                      <p>
                        Payment:{" "}
                        <strong>{formatStatus(appointment.payment_status)}</strong>
                      </p>
                      <p>
                        Notes:{" "}
                        <strong>{appointment.notes || "No notes added"}</strong>
                      </p>
                    </div>
                  </details>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function Bookings() {
  const bookings = sampleBookings;
  const [activeTab, setActiveTab] = useState("upcoming");

  const upcoming = bookings.filter((booking) =>
    ["pending", "confirmed"].includes(String(booking.status).toLowerCase()),
  );
  const past = bookings.filter(
    (booking) =>
      !["pending", "confirmed"].includes(String(booking.status).toLowerCase()),
  );
  const shownBookings = activeTab === "upcoming" ? upcoming : past;

  return (
    <section className="customer-bookings" aria-labelledby="customer-bookings-title">
      <header className="customer-bookings__header">
        <h1 id="customer-bookings-title">Bookings</h1>
        <p>Review your booked services and their schedule.</p>
      </header>
      <div className="customer-bookings__content">
        <div
          className="customer-bookings__tabs"
          role="tablist"
          aria-label="Booking status"
        >
          <button
            type="button"
            id="bookings-tab-upcoming"
            className={`customer-bookings__tab${activeTab === "upcoming" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "upcoming"}
            aria-controls="bookings-panel"
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming <span>({upcoming.length})</span>
          </button>
          <button
            type="button"
            id="bookings-tab-past"
            className={`customer-bookings__tab${activeTab === "past" ? " is-active" : ""}`}
            role="tab"
            aria-selected={activeTab === "past"}
            aria-controls="bookings-panel"
            onClick={() => setActiveTab("past")}
          >
            Past <span>({past.length})</span>
          </button>
        </div>
        <div
          className="customer-bookings__list"
          id="bookings-panel"
          role="tabpanel"
          aria-labelledby={`bookings-tab-${activeTab}`}
        >
          {shownBookings.length === 0 ? (
            <p className="customer-bookings__message">
              {activeTab === "upcoming"
                ? "You don’t have any upcoming bookings."
                : "No past bookings to show."}
            </p>
          ) : (
            shownBookings.map((booking) => {
              const scheduledAt = booking.scheduled_at
                ? new Date(booking.scheduled_at)
                : null;
              const validDate =
                scheduledAt && !Number.isNaN(scheduledAt.getTime());
              const status = String(booking.status || "pending");
              const serviceName = [booking.subcategory, booking.category]
                .filter(Boolean)
                .join(" · ");

              return (
                <article className="customer-booking" key={booking.id}>
                  <div className="customer-booking__icon" aria-hidden="true">
                    <FiBookmark />
                  </div>
                  <div className="customer-booking__main">
                    <h2 className="customer-booking__title">
                      {serviceName || "Booked service"}
                    </h2>
                    <p className="customer-booking__id">Booking #{booking.id}</p>
                    {booking.description ? (
                      <p className="customer-booking__description">
                        {booking.description}
                      </p>
                    ) : null}
                    <div className="customer-booking__facts">
                      <span>
                        <FiClock aria-hidden="true" />
                        {booking.duration_minutes
                          ? `${booking.duration_minutes} minutes`
                          : "Duration not set"}
                      </span>
                      <span>
                        <FiDollarSign aria-hidden="true" />
                        {formatCustomerPrice(booking.price)}
                      </span>
                      <span>
                        <FiCreditCard aria-hidden="true" />
                        {formatStatus(booking.payment_status)}
                      </span>
                    </div>
                    <span
                      className={`customer-booking__status customer-booking__status--${status.toLowerCase().replace(/[^a-z]+/g, "-")}`}
                    >
                      {formatStatus(status)}
                    </span>
                    <p className="customer-booking__date">
                      {validDate
                        ? scheduledAt.toLocaleString(undefined, {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })
                        : "Choose a time to schedule this service"}
                    </p>
                  </div>
                  <details className="customer-booking__details">
                    <summary>See details</summary>
                    <div className="customer-booking__details-content">
                      <p>
                        Payment:{" "}
                        <strong>{formatStatus(booking.payment_status)}</strong>
                      </p>
                      <p>
                        Notes:{" "}
                        <strong>{booking.notes || "No notes added"}</strong>
                      </p>
                    </div>
                  </details>
                </article>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}

function AccountOverview() {
  return (
    <section
      className="customer-account-overview"
      aria-labelledby="customer-account-overview-title"
    >
      <header className="customer-account-overview__header">
        <h1 id="customer-account-overview-title">Account Overview</h1>
      </header>

      <div className="customer-account-overview__grid">
        <article className="customer-account-option">
          <h2 className="customer-account-option__heading">Account Details</h2>
          <div className="customer-account-option__body">
            <p className="customer-account-option__primary">{sampleAccount.name}</p>
            <p className="customer-account-option__muted">{sampleAccount.email}</p>
          </div>
        </article>

        <article className="customer-account-option">
          <div className="customer-account-option__heading-row">
            <h2 className="customer-account-option__heading">Address Book</h2>
            <FiEdit3
              className="customer-account-option__edit-icon"
              aria-hidden="true"
            />
          </div>
          <div className="customer-account-option__body">
            <p className="customer-account-option__primary">
              Your default shipping address:
            </p>
            <address className="customer-account-option__address">
              {sampleAccount.address.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
          </div>
        </article>

        <article className="customer-account-option">
          <h2 className="customer-account-option__heading">Store Credit</h2>
          <div className="customer-account-option__body">
            <p className="customer-account-option__credit">
              <FiCreditCard aria-hidden="true" />
              <span>
                Store credit balance:{" "}
                <strong>{formatCustomerPrice(sampleAccount.storeCredit)}</strong>
              </span>
            </p>
          </div>
        </article>

        <article className="customer-account-option">
          <h2 className="customer-account-option__heading">
            Newsletter Preferences
          </h2>
          <div className="customer-account-option__body customer-account-option__body--newsletter">
            <p className="customer-account-option__primary">
              Manage your email communications to stay updated with the latest
              news and offers.
            </p>
            <Link
              className="customer-account-option__link"
              href="/newsletter"
            >
              Edit newsletter preferences
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}

function formatStatus(value) {
  if (!value) return "Unknown";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCustomerPrice(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Price unavailable";
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}
