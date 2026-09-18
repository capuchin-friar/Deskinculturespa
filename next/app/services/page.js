"use client"
import "./styles/xxl.css";
import _SERVICES from "../../src/json/services.json";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Services() {
  const router = useRouter();
  const [serviceList, setServiceList] = useState([]);
  const [serviceSubList, setServiceSubList] = useState([]);

  const [service, setService] = useState("");
  const [subService, setSubService] = useState("");
  /*
  |--------------------------------------------------------------------------
  | SERVICE OPTIONS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const { categories: services = [] } = _SERVICES;

    const servicesList = services.map(({ category }) => ({
      label: category,
      value: category,
    }));

    setServiceList(servicesList);
  }, []);

  return (
    <main className="treatments-section">
      <div className="treatments-container">
        <div className="section-badge">
          <svg
            className="badge-icon"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M7 12.5L9.5 15L17 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 5.5C5 4.672 5.672 4 6.5 4H9L10.5 2.5H13.5L15 4H17.5C18.328 4 19 4.672 19 5.5V18.5C19 19.328 18.328 20 17.5 20H6.5C5.672 20 5 19.328 5 18.5V5.5Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>

          <span>Our Features</span>
        </div>

        <h1 className="treatments-title">
          Enjoy All Your Favorite Treatments
          <br />
          At Home
        </h1>

        <div className="treatments-grid">
          {serviceList.map((treatment) => (
            <div
              key={treatment.name}
              className={`treatment-card ${treatment.wide ? "treatment-card-wide" : ""
                }`}
              style={{
                backgroundImage: `url("${treatment.image}")`,
              }}
              onClick={e => {
                let r = treatment.value.toLowerCase().replace(" ", "-");
                window.location.href = `/services/${r}`;
                // router.push(`/${treatment.value.toLowerCase().replace(" ", "-")}`)
              }}
            >
              <div className="card-overlay" />
              <span className="treatment-name">{treatment.value}</span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}