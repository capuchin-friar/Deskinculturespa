"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { baseApi } from "../api/shared/config";
import _CONSULTATIONS from "../../src/json/consultations.json";
import "../services/styles/xxl.css";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const modeNames = {
  physical: "In person",
  video: "Video call",
  audio: "Phone call",
  chat: "Chat",
  online: "Video call",
  phone: "Phone call",
};

export default function Consultation() {
  const [types, setTypes] = useState(
    _CONSULTATIONS.map((consultation) => ({ ...consultation, offers: [] })),
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    baseApi
      .get("customers/consultations")
      .then(({ data }) => {
        if (!data?.success || !Array.isArray(data.data)) return;
        if (mounted) setTypes(data.data);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="consultation-catalog">
      <section className="consultation-catalog-inner" aria-labelledby="consultations-title">
        <div className="catalog-eyebrow"><span aria-hidden="true">✳</span> PERSONAL GUIDANCE, EXPERT CARE</div>
        <h1 id="consultations-title">A little guidance can change everything.</h1>
        <p className="catalog-intro">Talk through your goals with a specialist and find a routine or treatment plan that works for you.</p>

        <div className="consultation-list" aria-label="Consultation services">
          {types.map(({ id, name, subtitle, description, image, offers = [] }, index) => (
            <section className="consultation-type" key={id}>
              <Link className="consultation-card" href={`/consultation/${id}`}>
                <span className="consultation-card-image">
                  <img src={image || "/consultation.png"} alt="" />
                  <span className="consultation-card-number">{String(index + 1).padStart(2, "0")}</span>
                </span>
                <span className="consultation-card-copy">
                  <span className="consultation-card-subtitle">{subtitle}</span>
                  <span className="consultation-card-title">{name}</span>
                  <span className="consultation-card-description">{description}</span>
                  <span className="consultation-card-link">
                    Explore consultation <span aria-hidden="true">↗</span>
                  </span>
                </span>
              </Link>

              <div className="consultation-created" aria-label={`${name} sessions`}>
                {loading ? (
                  <p className="consultation-created-empty">Loading available sessions…</p>
                ) : offers.length === 0 ? (
                  <p className="consultation-created-empty">No bookable sessions for this consultation yet.</p>
                ) : (
                  offers.map((offer) => (
                    <Link
                      key={offer.id}
                      className="consultation-created-item"
                      href={`/consultation/${id}`}
                    >
                      {offer.thumbnail_url ? (
                        <img src={offer.thumbnail_url} alt="" />
                      ) : (
                        <span className="consultation-created-thumb" aria-hidden="true" />
                      )}
                      <span>
                        <strong>{offer.duration_minutes} minute session</strong>
                        <small>
                          {modeNames[offer.mode] || offer.mode}
                          {offer.description ? ` · ${String(offer.description).slice(0, 72)}` : ""}
                        </small>
                      </span>
                      <em>
                        ₦{Number(offer.price || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}
                      </em>
                    </Link>
                  ))
                )}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
