"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IoArrowBackOutline, IoClose } from "react-icons/io5";
import { baseApi } from "@/app/api/shared/config";
import { useAccountNav } from "@/src/components/customer/AccountNavContext";
import { formatOrderPrice, mapCustomerOrder } from "./orderUtils";
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
import "./styles/orders.css";
import "./styles/order-detail.css";
import "./styles/booking-detail.css";
import "./styles/mobile.css";

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
      ) : section === "packages" ? (
        <Packages />
      ) : section === "account" ? (
        <AccountOverview />
      ) : (
        <Orders />
      )}
    </div>
  );
}

function Aside({ section }) {
  const { open, close } = useAccountNav();

  return (
    <>
      <button
        type="button"
        className={`customer-account-nav-backdrop${open ? " is-open" : ""}`}
        aria-label="Close account menu"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <aside
        id="customer-account-nav"
        className={`customer-account-nav${open ? " is-open" : ""}`}
        aria-label="Account navigation"
      >
        <div className="customer-account-nav__top">
          <p>Account</p>
          <button
            type="button"
            className="customer-account-nav__close"
            aria-label="Close account menu"
            onClick={close}
          >
            <IoClose size={22} aria-hidden="true" />
          </button>
        </div>
        <Link
          href="/customer/account"
          aria-current={section === "account" ? "page" : undefined}
          onClick={close}
        >
          <FiUser aria-hidden="true" />
          My Account
        </Link>
        <hr />
        {[
          { name: "Appointments", id: "appointments", Icon: FiCalendar },
          { name: "Bookings", id: "bookings", Icon: FiBookmark },
          { name: "Packages", id: "packages", Icon: FiPackage },
          { name: "Orders", id: "orders", Icon: FiPackage },
        ].map((o, i) => {
          const Icon = o.Icon;
          return (
            <Link
              href={`/customer/${o.id}`}
              key={i}
              aria-current={section === o.id ? "page" : undefined}
              onClick={close}
            >
              <Icon aria-hidden="true" />
              {o.name}
            </Link>
          );
        })}
      </aside>
    </>
  );
}

function OrderDetailView({ order, onBack }) {
  return (
    <div className="customer-order-detail">
      <header className="customer-order-detail__header">
        <button className="customer-order-detail__back" type="button" onClick={onBack}>
          <IoArrowBackOutline aria-hidden="true" />
          <span>Order Details</span>
        </button>
      </header>

      <section className="customer-order-detail__summary">
        <h1 id="customer-order-detail-title">Order nº {order.id}</h1>
        <p>
          {order.quantity} {order.quantity === 1 ? "Item" : "Items"}
        </p>
        {order.placedOn ? <p>Placed on {order.placedOn}</p> : null}
        <p>Total: ₦{formatOrderPrice(order.total)}</p>
      </section>

      <section className="customer-order-detail__items" aria-labelledby="order-items-title">
        <h2 id="order-items-title">Items in your order</h2>
        <ul>
          {order.items.map((item) => (
            <li className="customer-order-detail__item" key={item.id || item.item_id}>
              <div className="customer-order-detail__item-copy">
                <div className="customer-order-detail__badges">
                  <span className={`customer-order__status customer-order__status--${order.color}`}>
                    {order.status}
                  </span>
                </div>
                {order.estimatedDelivery || order.placedOn ? (
                  <p className="customer-order-detail__item-date">
                    {order.estimatedDelivery ? `On ${order.estimatedDelivery}` : `Placed ${order.placedOn}`}
                  </p>
                ) : null}
                <div className="customer-order-detail__item-body">
                  <div className="customer-order-detail__image">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" />
                    ) : (
                      <FiPackage aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3>{item.name || "Product"}</h3>
                    <p>Qty: {item.units}</p>
                    <strong>₦{formatOrderPrice(item.total_price)}</strong>
                  </div>
                </div>
              </div>
              {item.item_id ? (
                <Link className="customer-order-detail__again" href={`/store/${item.item_id}`}>
                  Buy again
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      <div className="customer-order-detail__info">
        <section aria-labelledby="payment-info-title">
          <h2 id="payment-info-title">Payment information</h2>
          <h3>Payment method</h3>
          <p>Paystack · Card, bank transfer or USSD</p>
          <h3>Payment details</h3>
          <p>Items total: ₦{formatOrderPrice(order.amountPaid || order.total)}</p>
          <p>Delivery fees: ₦{formatOrderPrice(order.shippingFee)}</p>
          {Number(order.tax) > 0 ? <p>Tax: ₦{formatOrderPrice(order.tax)}</p> : null}
          <p>
            <strong>Total: ₦{formatOrderPrice(order.total)}</strong>
          </p>
          {order.reference ? (
            <p>
              Reference: <strong>{order.reference}</strong>
            </p>
          ) : null}
          <p>Status: {order.paymentStatus || "paid"}</p>
        </section>

        <section aria-labelledby="delivery-info-title">
          <h2 id="delivery-info-title">Delivery information</h2>
          <h3>Delivery method</h3>
          <p>{order.shippingMethod || "Standard delivery"}</p>
          <h3>Delivery address</h3>
          {order.shipping?.street ? <p>{order.shipping.street}</p> : null}
          {order.shipping?.town || order.shipping?.state ? (
            <p>{[order.shipping.town, order.shipping.state].filter(Boolean).join(", ")}</p>
          ) : order.address ? (
            <p>{order.address}</p>
          ) : (
            <p>No delivery address was saved for this order.</p>
          )}
          {order.logisticProvider ? (
            <>
              <h3>Logistics</h3>
              <p>{order.logisticProvider}</p>
            </>
          ) : null}
          {order.trackingNumber ? (
            <>
              <h3>Tracking number</h3>
              <p>{order.trackingNumber}</p>
            </>
          ) : null}
          {order.estimatedDelivery ? (
            <>
              <h3>Estimated delivery</h3>
              <p>{order.estimatedDelivery}</p>
            </>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Orders() {
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await baseApi.get("customers/orders");
        if (!data?.success) throw new Error(data?.message || "Could not load orders.");
        if (!cancelled) setOrders(Array.isArray(data.data) ? data.data.map(mapCustomerOrder) : []);
      } catch (loadError) {
        if (!cancelled) {
          setOrders([]);
          setError(loadError?.response?.data?.message || loadError?.message || "Could not load your orders.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeOrders = orders.filter((order) => !order.archived);
  const archivedOrders = orders.filter((order) => order.archived);
  const currentOrders = activeTab === "active" ? activeOrders : archivedOrders;
  const selectedOrder = orders.find((order) => String(order.id) === String(selectedOrderId));

  return (
    <section
      className={`customer-orders${selectedOrder ? " customer-orders--detail" : ""}`}
      aria-labelledby={selectedOrder ? "customer-order-detail-title" : "customer-orders-title"}
    >
      {selectedOrder ? (
        <OrderDetailView order={selectedOrder} onBack={() => setSelectedOrderId(null)} />
      ) : (
        <>
      <header className="customer-orders__header">
        <h1 id="customer-orders-title">Orders</h1>
      </header>

      <div className="customer-orders__content">
        {/* <div
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
            Ongoing/Delivered <span>({activeOrders.length})</span>
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
            Canceled/Returned <span>({archivedOrders.length})</span>
          </button>
        </div> */}

        <div
          className="customer-orders__list"
          id="orders-panel"
          role="tabpanel"
          aria-labelledby={
            activeTab === "active" ? "orders-tab-active" : "orders-tab-archived"
          }
        >
          {loading ? (
            <p className="customer-orders__empty">Loading your orders…</p>
          ) : null}
          {!loading && error ? (
            <p className="customer-orders__empty">{error}</p>
          ) : null}
          {!loading && !error && currentOrders.length === 0 ? (
            <p className="customer-orders__empty">
              {activeTab === "active"
                ? "You don’t have any ongoing orders yet."
                : "You don’t have any cancelled or returned orders."}
            </p>
          ) : null}
          {!loading && !error
            ? currentOrders.map((order) => (
            <article className="customer-order" key={order.id}>
              <div className="customer-order__main">
                <div className="customer-order__heading">
                  <div>
                    <p className="customer-order__id">Order #{order.id}</p>
                    <span
                      className={`customer-order__status customer-order__status--${order.color}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <strong className="customer-order__total">₦{formatOrderPrice(order.total)}</strong>
                </div>
                <p className="customer-order__delivery">{order.delivery}</p>
                {order.items[0] ? (
                  <div className="customer-order__item">
                    <div className="customer-order__image" aria-hidden={!order.items[0].thumbnail_url}>
                      {order.items[0].thumbnail_url ? (
                        <img src={order.items[0].thumbnail_url} alt="" />
                      ) : (
                        <FiPackage />
                      )}
                    </div>
                    <div>
                      <h2 className="customer-order__title">
                        {order.items[0].name || "Product"}
                        {order.items.length > 1 ? (
                          <span className="customer-order__more">
                            {` +${order.items.length - 1} other ${order.items.length - 1 === 1 ? "item" : "items"}`}
                          </span>
                        ) : null}
                      </h2>
                      <p className="customer-order__meta">
                        Qty: {order.items[0].units}
                      </p>
                    </div>
                  </div>
                ) : null}
                <button
                  className="customer-order__details-link"
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                >
                  See details
                </button>
              </div>
            </article>
              ))
            : null}
        </div>
      </div>
        </>
      )}
    </section>
  );
}

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await baseApi.get("customers/appointments");
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || "Could not load your consultations.");
        }
        if (!cancelled) setAppointments(data.data);
      } catch (loadError) {
        if (!cancelled) {
          setAppointments([]);
          setError(loadError?.response?.data?.message || loadError?.message || "Could not load your consultations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

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
          {loading ? (
            <p className="customer-appointments__message">Loading your appointments…</p>
          ) : error ? (
            <p className="customer-appointments__message" role="alert">{error}</p>
          ) : shownAppointments.length === 0 ? (
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

function formatBookingWhen(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function bookingServiceName(booking) {
  return booking.subcategory || booking.category || "Service";
}

function bookingVisitKey(booking) {
  const payment = String(booking.payment_status || "pending").toLowerCase();
  const scheduled = booking.scheduled_at
    ? new Date(booking.scheduled_at).toISOString()
    : "unscheduled";
  return `${payment}:${scheduled}`;
}

function bookingStatusView(items) {
  const statuses = items.map((item) => String(item.status || "pending").toLowerCase());
  const paid = items.every((item) => String(item.payment_status || "").toLowerCase() === "paid");
  if (statuses.every((status) => ["cancelled", "canceled"].includes(status))) {
    return { label: "Cancelled", color: "gray" };
  }
  if (statuses.every((status) => status === "completed")) {
    return { label: "Completed", color: "green" };
  }
  if (statuses.some((status) => status === "confirmed")) {
    return { label: "Confirmed", color: "green" };
  }
  if (paid) return { label: "Booked", color: "blue" };
  return { label: "Pending", color: "blue" };
}

function mapBookingVisits(bookings) {
  const groups = new Map();
  for (const booking of bookings) {
    const key = bookingVisitKey(booking);
    const group = groups.get(key) || [];
    group.push(booking);
    groups.set(key, group);
  }

  return [...groups.values()].map((group) => {
    const items = [...group].sort((left, right) => Number(left.id) - Number(right.id));
    const first = items[0];
    const status = bookingStatusView(items);
    return {
      id: `visit-${items.map((item) => item.id).join("-")}`,
      number: first.id,
      scheduled_at: first.scheduled_at,
      payment_status: first.payment_status,
      notes: items.map((item) => item.notes).find(Boolean) || "",
      status: status.label,
      color: status.color,
      archived: items.every((item) => !["pending", "confirmed"].includes(String(item.status || "").toLowerCase())),
      quantity: items.length,
      duration_minutes: items.reduce((sum, item) => sum + Number(item.duration_minutes || 0), 0),
      total: items.reduce((sum, item) => sum + Number(item.price || 0), 0),
      items: items.map((item) => ({
        id: item.id,
        service_id: item.service_id,
        name: bookingServiceName(item),
        thumbnail_url: item.image_url,
        units: 1,
        unit_price: Number(item.price || 0),
        total_price: Number(item.price || 0),
        duration_minutes: item.duration_minutes,
      })),
    };
  });
}

function BookingDetailView({ visit, onBack }) {
  const scheduledLabel = formatBookingWhen(visit.scheduled_at);

  return (
    <div className="customer-order-detail">
      <header className="customer-order-detail__header">
        <button className="customer-order-detail__back" type="button" onClick={onBack}>
          <IoArrowBackOutline aria-hidden="true" />
          <span>Booking Details</span>
        </button>
      </header>

      <section className="customer-order-detail__summary">
        <h1 id="customer-booking-detail-title">Booking nº {visit.number}</h1>
        <p>
          {visit.quantity} {visit.quantity === 1 ? "Item" : "Items"}
        </p>
        {scheduledLabel ? <p>{scheduledLabel}</p> : <p>No appointment time has been saved yet.</p>}
        <p>Total: ₦{formatOrderPrice(visit.total)}</p>
      </section>

      <section className="customer-order-detail__items" aria-labelledby="booking-items-title">
        <h2 id="booking-items-title">Items in your booking</h2>
        <ul>
          {visit.items.map((item) => (
            <li className="customer-order-detail__item" key={item.id}>
              <div className="customer-order-detail__item-copy">
                <div className="customer-order-detail__badges">
                  <span className={`customer-order__status customer-order__status--${visit.color}`}>
                    {visit.status}
                  </span>
                </div>
                {scheduledLabel ? (
                  <p className="customer-order-detail__item-date">{scheduledLabel}</p>
                ) : null}
                <div className="customer-order-detail__item-body">
                  <div className="customer-order-detail__image">
                    {item.thumbnail_url ? (
                      <img src={item.thumbnail_url} alt="" />
                    ) : (
                      <FiBookmark aria-hidden="true" />
                    )}
                  </div>
                  <div>
                    <h3>{item.name}</h3>
                    <p>
                      Qty: {item.units}
                      {item.duration_minutes ? ` · ${item.duration_minutes} min` : ""}
                    </p>
                    <strong>₦{formatOrderPrice(item.total_price)}</strong>
                  </div>
                </div>
              </div>
              <Link className="customer-order-detail__again" href="/booking">
                Book again
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="customer-order-detail__info">
        <section aria-labelledby="booking-payment-title">
          <h2 id="booking-payment-title">Payment information</h2>
          <h3>Payment method</h3>
          <p>Paystack · Card, bank transfer or USSD</p>
          <h3>Payment details</h3>
          <p>Items total: ₦{formatOrderPrice(visit.total)}</p>
          <p>
            <strong>Total: ₦{formatOrderPrice(visit.total)}</strong>
          </p>
          <p>Status: {formatStatus(visit.payment_status)}</p>
        </section>

        <section aria-labelledby="booking-visit-title">
          <h2 id="booking-visit-title">Visit information</h2>
          <h3>Appointment time</h3>
          <p>{scheduledLabel || "Choose a time to schedule this service"}</p>
          <h3>Duration</h3>
          <p>{visit.duration_minutes ? `${visit.duration_minutes} minutes` : "Duration not set"}</p>
          <h3>Status</h3>
          <p>{visit.status}</p>
          <h3>Notes</h3>
          <p>{visit.notes || "No notes added"}</p>
        </section>
      </div>
    </div>
  );
}

function Packages() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await baseApi.get("customers/package-bookings");
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || "Could not load your packages.");
        }
        if (!cancelled) setBookings(data.data);
      } catch (loadError) {
        if (!cancelled) {
          setBookings([]);
          setError(loadError?.response?.data?.message || loadError?.message || "Could not load your packages.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const upcoming = bookings.filter((booking) => ["pending", "confirmed"].includes(String(booking.status || "")));
  const past = bookings.filter((booking) => !["pending", "confirmed"].includes(String(booking.status || "")));
  const shown = activeTab === "upcoming" ? upcoming : past;

  return (
    <section className="customer-appointments" aria-labelledby="customer-packages-title">
      <header className="customer-appointments__header">
        <h1 id="customer-packages-title">Packages</h1>
        <p>Review your booked packages separately from consultations.</p>
      </header>
      <div className="customer-appointments__content">
        <div className="customer-appointments__tabs" role="tablist" aria-label="Package status">
          <button
            type="button"
            className={`customer-appointments__tab${activeTab === "upcoming" ? " is-active" : ""}`}
            onClick={() => setActiveTab("upcoming")}
          >
            Upcoming <span>({upcoming.length})</span>
          </button>
          <button
            type="button"
            className={`customer-appointments__tab${activeTab === "past" ? " is-active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past <span>({past.length})</span>
          </button>
        </div>
        <div className="customer-appointments__list">
          {loading ? (
            <p className="customer-appointments__message">Loading your packages…</p>
          ) : error ? (
            <p className="customer-appointments__message" role="alert">{error}</p>
          ) : shown.length === 0 ? (
            <p className="customer-appointments__message">
              {activeTab === "upcoming" ? "You don’t have any upcoming packages." : "No past packages to show."}
            </p>
          ) : (
            shown.map((booking) => (
              <article className="customer-order" key={booking.id}>
                <div className="customer-order__main">
                  <div className="customer-order__heading">
                    <div>
                      <p className="customer-order__id">Package #{booking.id}</p>
                      <span className={`customer-order__status customer-order__status--${booking.payment_status === "paid" ? "paid" : "pending"}`}>
                        {booking.status}
                      </span>
                    </div>
                    <strong className="customer-order__total">₦{formatOrderPrice(booking.price)}</strong>
                  </div>
                  <p className="customer-order__delivery">
                    {booking.scheduled_at
                      ? new Date(booking.scheduled_at).toLocaleString()
                      : "Choose a time to start this package"}
                  </p>
                  <div className="customer-order__item">
                    <div className="customer-order__image">
                      {booking.image_url ? <img src={booking.image_url} alt="" /> : <FiPackage />}
                    </div>
                    <div>
                      <h2 className="customer-order__title">{booking.name || "Package"}</h2>
                      {booking.duration_months ? (
                        <p className="customer-order__meta">{booking.duration_months} months</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedVisitId, setSelectedVisitId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await baseApi.get("customers/bookings");
        if (!data?.success || !Array.isArray(data.data)) {
          throw new Error(data?.message || "Could not load your bookings.");
        }
        if (!cancelled) setBookings(data.data);
      } catch (loadError) {
        if (!cancelled) {
          setBookings([]);
          setError(loadError?.response?.data?.message || loadError?.message || "Could not load your bookings.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visits = mapBookingVisits(bookings);
  const upcoming = visits.filter((visit) => !visit.archived);
  const past = visits.filter((visit) => visit.archived);
  const shownVisits = activeTab === "upcoming" ? upcoming : past;
  const selectedVisit = visits.find((visit) => String(visit.id) === String(selectedVisitId));

  return (
    <section
      className={`customer-bookings${selectedVisit ? " customer-bookings--detail" : ""}`}
      aria-labelledby={selectedVisit ? "customer-booking-detail-title" : "customer-bookings-title"}
    >
      {selectedVisit ? (
        <BookingDetailView visit={selectedVisit} onBack={() => setSelectedVisitId(null)} />
      ) : (
        <>
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
          {loading ? (
            <p className="customer-bookings__message">Loading your bookings…</p>
          ) : error ? (
            <p className="customer-bookings__message" role="alert">{error}</p>
          ) : shownVisits.length === 0 ? (
            <p className="customer-bookings__message">
              {activeTab === "upcoming"
                ? "You don’t have any upcoming bookings."
                : "No past bookings to show."}
            </p>
          ) : (
            shownVisits.map((visit) => {
              const firstItem = visit.items[0];
              const extraCount = visit.items.length - 1;
              return (
                <article className="customer-order" key={visit.id}>
                  <div className="customer-order__main">
                    <div className="customer-order__heading">
                      <div>
                        <p className="customer-order__id">Booking #{visit.number}</p>
                        <span className={`customer-order__status customer-order__status--${visit.color}`}>
                          {visit.status}
                        </span>
                      </div>
                      <strong className="customer-order__total">₦{formatOrderPrice(visit.total)}</strong>
                    </div>
                    <p className="customer-order__delivery">
                      {formatBookingWhen(visit.scheduled_at) || "Choose a time to schedule this service"}
                    </p>
                    {firstItem ? (
                      <div className="customer-order__item">
                        <div className="customer-order__image" aria-hidden={!firstItem.thumbnail_url}>
                          {firstItem.thumbnail_url ? (
                            <img src={firstItem.thumbnail_url} alt="" />
                          ) : (
                            <FiBookmark />
                          )}
                        </div>
                        <div>
                          <h2 className="customer-order__title">
                            {firstItem.name}
                            {extraCount > 0 ? (
                              <span className="customer-order__more">
                                {` +${extraCount} other ${extraCount === 1 ? "booking" : "bookings"}`}
                              </span>
                            ) : null}
                          </h2>
                          {firstItem.duration_minutes ? (
                            <p className="customer-order__meta">{firstItem.duration_minutes} minutes</p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                    <button
                      className="customer-order__details-link"
                      type="button"
                      onClick={() => setSelectedVisitId(visit.id)}
                    >
                      See details
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
        </>
      )}
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
