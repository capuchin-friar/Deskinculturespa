"use client";

import { useEffect, useState } from "react";
import "./styles/xxl.css";
import { useRouter } from "next/navigation";
import _SERVICES from "../../../src/json/services.json";
import useServiceHandler from "../../../src/hooks/service";
import Formatter from "../../../src/utils/formatter";
import useToggler from "../../../src/hooks/toggler";
import { set_service } from "../../../redux/customer/service";
import { useDispatch, useSelector } from "react-redux";
// const bookings = [
//   {
//     id: 1,
//     title: "Organic Massage",
//     duration: "60 minutes",
//     price: "£50.00",
//   },
//   {
//     id: 2,
//     title: "Relaxing Massage",
//     duration: "60 minutes",
//     price: "£50.00",
//   },
// ];

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

function EditIcon() {
  return (
    <svg
      width="23"
      height="23"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 20L4.8 16.2L16.9 4.1C17.5 3.5 18.5 3.5 19.1 4.1L19.9 4.9C20.5 5.5 20.5 6.5 19.9 7.1L7.8 19.2L4 20Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M14.8 6.2L17.8 9.2" stroke="currentColor" strokeWidth="1.5" />
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

export default function Page({ params }) {
  const dispatch = useDispatch();
  const { service: bookings } = useSelector((s) => s.service);
  const { addToCart, rmFromCart } = useToggler();

  const { services: s } = useServiceHandler();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);

  const openServiceModal = (service) => {
    setSelectedService(service);
  };

  const closeServiceModal = () => {
    setSelectedService(null);
  };

  useEffect(() => {
    const r = window.location.pathname
      .split("/")
      .splice(-1)[0]
      .replace("-", " ");
    const filteredServices = s.filter((s) => s.category.toLowerCase() === r);
    setServices(filteredServices);
  }, [s]);

  const handleBookService = async (service) => {
    /*
          Add your booking/cart logic here.
    
          For example:
          - add service to cart
          - open booking date/time selector
          - update booking sidebar
          - etc.
        */

    // console.log("Book service:", service);
    let checkIfExist = bookings.some((b) => b.id === service.id);
    if (checkIfExist) {
      await rmFromCart(service.id, "service");
      let newList = bookings.filter((b) => b.id !== service.id);
      dispatch(set_service(newList));
      return;
    }
    let item = { id: service.id };
    await addToCart({ item, qty: 1, type: "service" });
    dispatch(set_service([...bookings, service]));
    closeServiceModal();
  };

  function getTotal() {
    return bookings.reduce((a, c) => {
      return a + Number(c.price);
    }, 0);
  }

  useEffect(() => {
    dispatch(set_service(bookings));
  }, [bookings, dispatch]);

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
              <h1>Massage</h1>

              <p>24 treatment</p>

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
                    <h2>{service.subcategory}</h2>

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
                      onClick={(event) => {
                        event.stopPropagation();
                        handleBookService(service);
                      }}
                    >
                      {bookings.some((b) => b.id === service.id)
                        ? "Unbook Service"
                        : "Book Service"}
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
              {bookings.map((booking) => (
                <div className="booking-item" key={booking.id}>
                  <div className="booking-item-header">
                    <strong>{booking.title ?? booking.subcategory}</strong>

                    <strong>
                      ₦
                      {Number(booking.price).toLocaleString("en-NG", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                  </div>

                  <div className="booking-item-middle">
                    <span>
                      {booking.duration ?? booking.duration_minutes} Mins
                    </span>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={(e) => {
                        handleBookService(booking);
                      }}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="professional-row">
                    <span className="professional-label">Professional :</span>

                    <div className="professional">
                      <div className="professional-avatar">
                        <img
                          src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80"
                          alt="Professional"
                        />
                      </div>

                      <span>Chinelo Stella</span>
                    </div>
                  </div>
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

            {/* Select Time */}
            <button
              type="button"
              className="select-time-button"
              onClick={(e) => {
                let r = window.location.pathname.split("/").splice(-1);
                window.location.href = `/booking?type=services&id=${r}`;
                // router.push(`/${treatment.value.toLowerCase().replace(" ", "-")}`)
              }}
            >
              Select time
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
              <img
                src={selectedService.image}
                alt={selectedService.title}
                className="modal-image"
              />

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
              <h2 id="service-modal-title">{selectedService.title}</h2>

              <p className="modal-description">{selectedService.description}</p>

              {/* Service information */}
              <div className="modal-service-info">
                <div className="modal-info-item">
                  <span className="modal-info-label">Price</span>

                  <strong className="modal-price">
                    {selectedService.price}
                  </strong>
                </div>

                <div className="modal-info-divider" />

                <div className="modal-info-item">
                  <span className="modal-info-label">Duration</span>

                  <div className="duration-value">
                    <ClockIcon />

                    <strong>{selectedService.duration}</strong>
                  </div>
                </div>
              </div>

              {/* Modal Action */}
              <button
                type="button"
                className="modal-book-button"
                onClick={() => handleBookService(selectedService)}
              >
                Book Service
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
