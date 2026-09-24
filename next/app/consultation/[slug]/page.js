"use client";

import { useEffect, useState } from "react";
import "./styles/xxl.css";
import _CONSULTATIONS from "../../../src/json/consultations.json";

const categories = [
  {
    id: "skincare",
    name: "Skincare Consultation",
    subtitle: "Healthy, glowing skin",
    icon: "♙",
    description:
      "Get expert advice on your skin concerns, a personalized routine and treatment recommendations.",
    image:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "haircare",
    name: "Haircare Consultation",
    subtitle: "Stronger, healthier hair",
    icon: "♧",
    description:
      "Discuss your hair and scalp concerns and get a personalized care plan.",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "wellness",
    name: "Wellness Consultation",
    subtitle: "Lifestyle & self-care",
    icon: "♢",
    description:
      "Explore your wellness goals and receive guidance tailored to your lifestyle.",
    image:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "body",
    name: "Body Treatment Consultation",
    subtitle: "Tailored body treatments",
    icon: "♙",
    description:
      "Discuss your body care goals and discover suitable treatments.",
    image:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=500&q=85",
  },
  {
    id: "nutrition",
    name: "Nutrition Consultation",
    subtitle: "Personalized nutrition advice",
    icon: "◉",
    description:
      "Discuss your wellness goals and receive practical nutrition guidance.",
    image:
      "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=85",
  },
];

const modes = [
  {
    id: "in-person",
    name: "In-person",
    subtitle: "At our spa",
    icon: "⌂",
    price: 0,
  },
  {
    id: "video",
    name: "Video call",
    subtitle: "Online meeting",
    icon: "▣",
    price: 2500,
  },
  {
    id: "phone",
    name: "Phone call",
    subtitle: "Audio call",
    icon: "⌕",
    price: 1500,
  },
];

const durations = [
  {
    id: "30",
    name: "30 minutes",
    price: 10000,
  },
  {
    id: "45",
    name: "45 minutes",
    price: 15000,
  },
  {
    id: "60",
    name: "60 minutes",
    price: 20000,
  },
];

// export default function Page() {
//   const [activeCategory, setActiveCategory] = useState("skincare");
//   const [activeMode, setActiveMode] = useState("in-person");
//   const [activeDuration, setActiveDuration] = useState("30");

//   const selectedAppointment? =
//     categories.find((item) => item.id === activeCategory) ||
//     categories[0];

//   const selectedMode =
//     modes.find((item) => item.id === activeMode) ||
//     modes[0];

//   const selectedDuration =
//     durations.find((item) => item.id === activeDuration) ||
//     durations[0];

//   const total =
//     selectedDuration.price + selectedMode.price;

//   return (
//     <div className="consultation-cnt">

//     </div>
//   );
// }


const bookings = [
  {
    id: 1,
    title: "Organic Massage",
    duration: "60 minutes",
    price: "£50.00",
  },
  {
    id: 2,
    title: "Relaxing Massage",
    duration: "60 minutes",
    price: "£50.00",
  },
];

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

export default function Page({ params }) {
  const [selectedAppointment, setSelectedAppointment] = useState({});
  const [activeCategory, setActiveCategory] = useState("skincare");
  const [activeMode, setActiveMode] = useState("in-person");
  const [activeDuration, setActiveDuration] = useState("30");

  const selectedCategory =
    categories.find((item) => item.id === activeCategory) || categories[0];

  const selectedMode = modes.find((item) => item.id === activeMode) || modes[0];

  const selectedDuration =
    durations.find((item) => item.id === activeDuration) || durations[0];

  const total = selectedDuration.price + selectedMode.price;

  useEffect(() => {
    let _R = _CONSULTATIONS.filter((_C) => {
      let p = window.location.pathname
        .split("/")
        .splice(-1)[0]
        .split("-")
        .join(" ");
      return _C.name.toLowerCase() === p.toLowerCase() ? _C : {};
    });
    setSelectedAppointment(_R[0]);
  }, []);

  return (
    <div className="massage-page">
      <div className="page-layout">
        {/* =========================================
            LEFT SIDE
        ========================================= */}

        <section className="category-section">
          {/* Hero */}
          <div className="category-hero">
            <div className="hero-overlay" />

            <div className="hero-content">
              <h1>
                {window.location.pathname
                  .split("/")
                  .splice(-1)[0]
                  .split("-")
                  .join(" ")}
              </h1>
            </div>
          </div>

          {/* Services */}
          <div className="services-container">
            {/* MAIN BOOKING CARD */}
            <div className="consultation-content">
              {/* SELECTED CONSULTATION */}
              <div className="selected-consultation">
                <div className="selected-consultation-text">
                  <h3>{selectedAppointment?.name}</h3>

                  <p>{selectedAppointment?.description}</p>
                </div>

                <div
                  className="selected-consultation-image"
                  style={{
                    backgroundImage: `url(${selectedAppointment?.image})`,
                  }}
                />
              </div>

              {/* MODE */}
              <div className="selection-section">
                <h4>Select mode</h4>

                <div className="mode-grid">
                  {modes.map((mode) => {
                    const selected = activeMode === mode.id;

                    return (
                      <button
                        key={mode.id}
                        className={`mode-card ${selected ? "selected" : ""}`}
                        onClick={() => setActiveMode(mode.id)}
                      >
                        <div
                          className={`selection-radio ${
                            selected ? "checked" : ""
                          }`}
                        >
                          {selected && "✓"}
                        </div>

                        <div className="mode-icon">{mode.icon}</div>

                        <div className="option-text">
                          <strong>{mode.name}</strong>

                          <span>{mode.subtitle}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DURATION */}
              <div className="selection-section duration-section">
                <h4>Duration</h4>

                <div className="duration-grid">
                  {durations.map((duration) => {
                    const selected = activeDuration === duration.id;

                    return (
                      <button
                        key={duration.id}
                        className={`duration-card ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() => setActiveDuration(duration.id)}
                      >
                        <div
                          className={`selection-radio ${
                            selected ? "checked" : ""
                          }`}
                        >
                          {selected && "✓"}
                        </div>

                        <div>
                          <strong>{duration.name}</strong>

                          <span>₦{duration.price.toLocaleString()}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <br />
              {/* CONTINUE */}
              <button
                className="continue-button"
                onClick={() => {
                  console.log({
                    category: activeCategory,
                    mode: activeMode,
                    duration: activeDuration,
                    price: total,
                  });
                }}
              >
                <span>Book Now</span>

                <span className="continue-arrow">→</span>
              </button>
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
                  <strong>SW1A</strong>

                  <span>1430 Vesta Drive, Chicago</span>
                </div>
              </div>

              <button
                type="button"
                className="edit-address-button"
                aria-label="Edit address"
              >
                <EditIcon />
              </button>
            </div>

            {/* Booking Items */}
            <div className="booking-items">
              {bookings.map((booking) => (
                <div className="booking-item" key={booking.id}>
                  <div className="booking-item-header">
                    <strong>{booking.title}</strong>

                    <strong>{booking.price}</strong>
                  </div>

                  <div className="booking-item-middle">
                    <span>{booking.duration}</span>

                    <button type="button" className="remove-button">
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

                      <span>jack Jane</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="booking-total">
              <strong>Total</strong>

              <strong>£100</strong>
            </div>

            {/* Select Time */}
            <button
              type="button"
              className="select-time-button"
              onClick={(e) => {
                let r = window.location.pathname.split("/").splice(-1);
                window.location.href = `/services/${r}/booking`;
                // router.push(`/${treatment.value.toLowerCase().replace(" ", "-")}`)
              }}
            >
              Select time
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
