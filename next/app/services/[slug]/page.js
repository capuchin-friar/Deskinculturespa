"use client";

import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import useServiceHandler from "../../../src/hooks/service";
import { set_service } from "../../../redux/customer/service";
import "./styles/xxl.css";

export default function Page() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { services: allServices } = useServiceHandler();
  const { service: bookings } = useSelector((state) => state.service);
  const [services, setServices] = useState([]);

  useEffect(() => {
    const category = decodeURIComponent(window.location.pathname.split("/").pop()).replace(/-/g, " ").toLowerCase();
    setServices(allServices.filter((service) => service.category?.toLowerCase() === category));
  }, [allServices]);

  function toggleService(service) {
    const exists = bookings.some((item) => item.id === service.id);
    const next = exists
      ? bookings.filter((item) => item.id !== service.id)
      : [...bookings, service];
    dispatch(set_service(next));
  }

  const total = bookings.reduce((sum, service) => sum + Number(service.price), 0);

  return (
    <main className="massage-page">
      <div className="page-layout">
        <section className="category-section">
          <div className="category-hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>Services</h1>
              <p>{services.length} treatments</p>
            </div>
          </div>

          <div className="services-container">
            <div className="services-grid">
              {services.map((service) => {
                const selected = bookings.some((item) => item.id === service.id);
                return (
                  <article className="service-card" key={service.id}>
                    <div className="service-card-content">
                      <h2>{service.subcategory}</h2>
                      <p>{service.description}</p>
                    </div>
                    <div className="service-card-footer">
                      <div className="service-meta">
                        <div className="price-container">
                          <span className="price-label">Price</span>
                          <strong>₦{Number(service.price).toLocaleString("en-NG")}</strong>
                        </div>
                        <div className="duration-container">
                          <span>{service.duration_minutes || 60} Mins</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="book-service-button"
                        onClick={() => toggleService(service)}
                      >
                        {selected ? "Remove" : "Book Service"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <aside className="booking-sidebar">
          <div className="booking-panel">
            <h2 className="booking-title">Your Bookings</h2>
            <div className="booking-items">
              {bookings.map((booking) => (
                <div className="booking-item" key={booking.id}>
                  <div className="booking-item-header">
                    <strong>{booking.subcategory}</strong>
                    <strong>₦{Number(booking.price).toLocaleString("en-NG")}</strong>
                  </div>
                  <div className="booking-item-middle">
                    <span>{booking.duration_minutes || 60} Mins</span>
                    <button type="button" className="remove-button" onClick={() => toggleService(booking)}>Remove</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="booking-total">
              <strong>Total</strong>
              <strong>₦{total.toLocaleString("en-NG")}</strong>
            </div>

            <button
              type="button"
              className="select-time-button"
              disabled={!bookings.length}
              onClick={() => router.push("/booking")}
            >
              Select time
            </button>
          </div>
        </aside>
      </div>
    </main>
  );
}
