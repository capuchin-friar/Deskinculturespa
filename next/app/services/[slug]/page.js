"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";
import useServiceHandler from "../../../src/hooks/service";
import useServiceToggler from "../../../src/hooks/serviceToggler";

function LocationIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20 10.5C20 15.5 12 21 12 21C12 21 4 15.5 4 10.5C4 6.91 7.58 4 12 4C16.42 4 20 6.91 20 10.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 14L12 8L18 14"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />

      <path
        d="M12 7.5V12L15 14"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Page() {
  const { slug } = useParams();
  const router = useRouter();
  const { services: s } = useServiceHandler();
  const { bookings, loading: bookingsLoading, loadError, getBooking, isBooked, isBusy, toggleService } = useServiceToggler();
  const [selectedService, setSelectedService] = useState(null);
  const [bookingMessage, setBookingMessage] = useState("");

  const openServiceModal = (service) => {
    setBookingMessage("");
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  const categorySlug = String(slug ?? "").replaceAll("-", " ").toLowerCase();
  const services = useMemo(
    () => s.filter((service) => service.category?.toLowerCase() === categorySlug),
    [s, categorySlug],
  );

  const handleBookService = async (service) => {
    setBookingMessage("");
    try {
      const serviceId = service.service_id ?? service.id;
      const existing = getBooking(serviceId);
      const succeeded = await toggleService({ serviceId });
      if (!succeeded) return;

      setBookingMessage(existing ? "Service removed from your bookings." : "Service added to your bookings.");
      closeServiceModal();
    } catch (error) {
      setBookingMessage(error.message || "Could not update this booking. Please try again.");
    }
  };

  const activeBookings = bookings.filter((booking) => ["pending", "confirmed"].includes(booking.status));
  const getTotal = () => activeBookings.reduce((total, booking) => total + Number(booking.price || 0), 0);
  const selectedBooking = selectedService ? getBooking(selectedService.id) : null;

  return (
    <main className="massage-page">
      <div className="page-layout">
        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <section className="category-section">
          {/* Hero */}
          <div className="category-hero">
            <div className="hero-overlay" />

            <div className="hero-content">
              <h1>{services[0]?.category || "Services"}</h1>

              <p>{services.length} {services.length === 1 ? "treatment" : "treatments"}</p>

              <button
                type="button"
                className="hero-collapse-button"
                aria-label="Collapse category"
              >
                <ChevronUpIcon />
              </button>
            </div>
          </div>

          {/* Services */}
          <div className="services-container">
            <div className="services-grid">
              {services.map((service) => (
                <article
                  className="service-card"
                  key={service.id}
                  onClick={() => openServiceModal(service)}
                >
                  <div className="service-card-content">
                    <h2>{service.subcategory ?? service.name}</h2>

                    <p>{service.description}</p>
                  </div>

                  <div className="service-card-footer">
                    <div className="service-meta">
                      <div className="price-container">
                        <span className="price-label">Start from</span>

                        <strong>
                          ₦
                          {Number(service.price).toLocaleString("en-NG", {
                            maximumFractionDigits: 2,
                          })}
                        </strong>
                      </div>

                      <div className="duration-container">
                        <ClockIcon />

                        <span>{service.duration_minutes} Mins</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="book-service-button"
                      disabled={bookingsLoading || isBusy(service.id) || (isBooked(service.id) && getBooking(service.id)?.status === "confirmed")}
                      onClick={(event) => {
                        event.stopPropagation();
                        handleBookService(service);
                      }}
                    >
                      {isBusy(service.id) ? "Updating…" : getBooking(service.id)?.status === "confirmed" ? "Confirmed" : isBooked(service.id) ? "UnBook" : "Book"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* =========================================
            RIGHT BOOKING SIDEBAR
        ========================================= */}

        <aside className="booking-sidebar">
          <div className="booking-panel">
            <h2 className="booking-title">Your Bookings</h2>

            {/* Address */}
            <div className="booking-address">
              <div className="address-left">
                <LocationIcon />

                <div>
                  <strong>Awka</strong>

                  <span>Arooma, Ifite-Awka</span>
                </div>
              </div>

              {/* <button
                type="button"
                className="edit-address-button"
                aria-label="Edit address"
              >
                <EditIcon />
              </button> */}
            </div>

            {/* Booking Items */}
            <div className="booking-items">
              {loadError && <p className="booking-feedback" role="alert">{loadError}</p>}
              {bookingsLoading && <p className="booking-empty">Loading your bookings…</p>}
              {!bookingsLoading && activeBookings.length === 0 && <p className="booking-empty">No services in your bookings yet.</p>}
              {activeBookings.map((booking) => (
                <div className="booking-item" key={booking.id}>
                  <div className="booking-item-header">
                    <strong>{booking.subcategory ?? booking.category ?? "Service"}</strong>

                    <strong>
                      ₦
                      {Number(booking.price).toLocaleString("en-NG", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>

                  <div className="booking-item-middle">
                    <span>
                      {booking.duration_minutes ? `${booking.duration_minutes} Mins` : booking.status}
                    </span>

                    {booking.status === "pending" ? (
                      <button
                        type="button"
                        className="remove-button"
                        disabled={isBusy(booking.service_id)}
                        onClick={() => handleBookService(booking)}
                      >
                        {isBusy(booking.service_id) ? "Removing…" : "Remove"}
                      </button>
                    ) : <span className="booking-status">Confirmed</span>}
                  </div>

                  <p className="booking-scheduled-at">
                    {booking.scheduled_at ? `Preferred time: ${new Date(booking.scheduled_at).toLocaleString()}` : "Appointment not arranged"}
                  </p>

                </div>
              ))}
            </div>

            {/* Total */}
            <div className="booking-total">
              <strong>Total</strong>

              <strong>
                ₦
                {Number(getTotal()).toLocaleString("en-NG", {
                  maximumFractionDigits: 2,
                })}
              </strong>
            </div>

            {bookingMessage && <p className="booking-feedback" role="status" aria-live="polite">{bookingMessage}</p>}

            {/* Select Time */}
            <button
              type="button"
              className="select-time-button"
              disabled={activeBookings.length === 0}
              onClick={() => router.push("/customer/booking")}
            >
              Arrange appointment
            </button>
          </div>
        </aside>
      </div>

      {/* =========================================
          SERVICE DETAILS MODAL
      ========================================= */}

      {selectedService && (
        <div className="service-modal-backdrop" onClick={closeServiceModal}>
          <div
            className="service-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="modal-image-container">
              {selectedService.image_url ? <img
                src={selectedService.image_url}
                alt={selectedService.subcategory || selectedService.category || "Service"}
                className="modal-image"
              /> : <div className="modal-image-placeholder" aria-hidden="true" />}
              <button
                type="button"
                className="modal-close-button"
                onClick={closeServiceModal}
                aria-label="Close service details"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Content */}
            <div className="modal-content">
              <h2 id="service-modal-title">{selectedService.subcategory || selectedService.category || "Service"}</h2>

              <p className="modal-description">{selectedService.description}</p>

              {/* Service information */}
              <div className="modal-service-info">
                <div className="modal-info-item">
                  <span className="modal-info-label">Price</span>

                  <strong className="modal-price">
                    ₦{Number(selectedService.price || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="modal-info-divider" />

                <div className="modal-info-item">
                  <span className="modal-info-label">Duration</span>

                  <div className="duration-value">
                    <ClockIcon />

                    <strong>{selectedService.duration_minutes ? `${selectedService.duration_minutes} Mins` : "Duration arranged with the team"}</strong>
                  </div>
                </div>
              </div>

              {bookingMessage && <p className="booking-feedback" role="status" aria-live="polite">{bookingMessage}</p>}

              {/* Modal Action */}
              <button
                type="button"
                className="modal-book-button"
                disabled={bookingsLoading || isBusy(selectedService.id) || selectedBooking?.status === "confirmed"}
                onClick={() => handleBookService(selectedService)}
              >
                {isBusy(selectedService.id) ? "Updating…" : selectedBooking?.status === "confirmed" ? "Booking confirmed" : selectedBooking ? "Remove from bookings" : "Book"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
