import Link from "next/link";
import _CONSULTATIONS from "../../src/json/consultations.json";
import "../services/styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

export default function Consultation() {
  return (
    <main className="consultation-catalog">
      <section className="consultation-catalog-inner" aria-labelledby="consultations-title">
        <div className="catalog-eyebrow"><span aria-hidden="true">✳</span> PERSONAL GUIDANCE, EXPERT CARE</div>
        <h1 id="consultations-title">A little guidance can change everything.</h1>
        <p className="catalog-intro">Talk through your goals with a specialist and find a routine or treatment plan that works for you.</p>

        <div className="consultation-list" aria-label="Consultation services">
          {_CONSULTATIONS.map(({ id, name, subtitle, description, image }, index) => {
            return (
            <Link className="consultation-card" href={`/consultation/${id}`} key={id}>
              <span className="consultation-card-image">
                <img src={image || "/consultation.png"} alt="" />
                <span className="consultation-card-number">{String(index + 1).padStart(2, "0")}</span>
              </span>
              <span className="consultation-card-copy">
                <span className="consultation-card-subtitle">{subtitle}</span>
                <span className="consultation-card-title">{name}</span>
                <span className="consultation-card-description">{description}</span>
                <span className="consultation-card-link">Explore consultation <span aria-hidden="true">↗</span></span>
              </span>
            </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
