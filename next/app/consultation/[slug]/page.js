"use client";

import { useEffect, useMemo, useState } from "react";
import "./styles/xxl.css";
import consultations from "../../../src/json/consultations.json";

const modes = [
  { id: "in-person", name: "In-person", dbModes: ["physical"], subtitle: "At our spa" },
  { id: "video", name: "Video call", dbModes: ["video"], subtitle: "Online meeting" },
  { id: "phone", name: "Phone call", dbModes: ["audio"], subtitle: "Audio call" },
];

const durations = [30, 45, 60];

export default function Page() {
  const [selected, setSelected] = useState(null);
  const [activeMode, setActiveMode] = useState("in-person");
  const [activeDuration, setActiveDuration] = useState(30);
  const [offerings, setOfferings] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const slug = window.location.pathname.split("/").pop().replace(/-/g, " ").toLowerCase();
    setSelected(consultations.find((item) => item.name.toLowerCase() === slug) || consultations[0]);

    fetch("/api/appointment-offerings")
      .then((response) => response.json())
      .then((payload) => setOfferings(payload.success ? payload.data : []))
      .catch(() => setOfferings([]));
  }, []);

  const mode = modes.find((item) => item.id === activeMode);
  const offering = useMemo(
    () => offerings.find((item) => mode?.dbModes.includes(item.mode) && Number(item.duration_minutes) === activeDuration),
    [offerings, mode, activeDuration],
  );

  async function checkout() {
    if (!offering || !appointmentDate || loading) return;
    setLoading(true);

    try {
      const response = await fetch("/api/checkout/appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offering_id: Number(offering.id),
          appointment_date: appointmentDate,
          start_time: startTime,
        }),
      });
      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.data || payload.message || "Unable to initialize appointment checkout");
      }

      window.location.assign(payload.data.authorization_url);
    } catch (error) {
      alert(error.message || "Unable to initialize payment");
      setLoading(false);
    }
  }

  return (
    <main className="massage-page">
      <div className="page-layout">
        <section className="category-section">
          <div className="category-hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <h1>{selected?.name || "Consultation"}</h1>
              <p>{selected?.subtitle}</p>
            </div>
          </div>

          <div className="services-container">
            <div className="consultation-content">
              <div className="selected-consultation">
                <div className="selected-consultation-text">
                  <h3>{selected?.name}</h3>
                  <p>{selected?.description}</p>
                </div>
                <div className="selected-consultation-image" style={{ backgroundImage: `url(${selected?.image})` }} />
              </div>

              <div className="selection-section">
                <h4>Select mode</h4>
                <div className="mode-grid">
                  {modes.map((item) => (
                    <button type="button" key={item.id} className={`mode-card ${activeMode === item.id ? "selected" : ""}`} onClick={() => setActiveMode(item.id)}>
                      <strong>{item.name}</strong>
                      <span>{item.subtitle}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="selection-section duration-section">
                <h4>Duration</h4>
                <div className="duration-grid">
                  {durations.map((duration) => (
                    <button type="button" key={duration} className={`duration-card ${activeDuration === duration ? "selected" : ""}`} onClick={() => setActiveDuration(duration)}>
                      <strong>{duration} minutes</strong>
                    </button>
                  ))}
                </div>
              </div>

              <div className="selection-section">
                <h4>Appointment date</h4>
                <input type="date" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} min={new Date().toISOString().slice(0, 10)} />
              </div>

              <div className="selection-section">
                <h4>Start time</h4>
                <input type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} />
              </div>
            </div>
          </div>
        </section>

        <aside className="booking-sidebar">
          <div className="booking-panel">
            <h2 className="booking-title">Consultation summary</h2>
            <div className="booking-item">
              <div className="booking-item-header">
                <strong>{selected?.name}</strong>
                <strong>{offering ? `₦${Number(offering.price).toLocaleString("en-NG")}` : "—"}</strong>
              </div>
              <div className="booking-item-middle">
                <span>{activeDuration} minutes • {mode?.name}</span>
              </div>
            </div>

            <button type="button" className="select-time-button" disabled={!offering || !appointmentDate || loading} onClick={checkout}>
              {loading ? "Processing..." : "Continue to payment"}
            </button>

            {!offering && <p>No matching consultation offering is currently available for this mode and duration.</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
