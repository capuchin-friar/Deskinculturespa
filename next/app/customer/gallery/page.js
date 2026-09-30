"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const treatments = [
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Tartar removal", "Dental Care", "Tartar removal before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Tartar removal", "Dental Care", "Tartar removal before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Tartar removal and whitening", "Dental Care", "Dental cleaning before and after"],
  ["Tartar removal", "Dental Care", "Tartar removal before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Tartar removal", "Dental Care", "Tartar removal before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Teeth whitening", "Dental Care", "Teeth whitening before and after"],
  ["Chemical burn care", "Body Treatments", "Foot care treatment before and after"],
  ["Hyperpigmentation care", "Body Treatments", "Foot hyperpigmentation treatment before and after"],
  ["Dark knuckle care", "Body Treatments", "Hand treatment before and after"],
  ["Manicure", "Nail and Foot Care", "Hand manicure result"],
  ["Dark knuckle care", "Body Treatments", "Dark knuckle treatment progress"],
  ["Laser scar care", "Body Treatments", "Laser scar treatment before and after"],
  ["Laser scar care", "Body Treatments", "Laser scar treatment before and after"],
  ["Underarm waxing", "Waxing", "Underarm waxing before and after"],
  ["Underarm waxing", "Waxing", "Underarm waxing before and after"],
  ["Underarm waxing", "Waxing", "Underarm waxing before and after"],
  ["Underarm waxing", "Waxing", "Underarm waxing before and after"],
  ["Body waxing", "Waxing", "Waxing result before and after"],
  ["Pedicure", "Nail and Foot Care", "Pedicure result before and after"],
  ["Pedicure", "Nail and Foot Care", "Pedicure result before and after"],
  ["Scalp care", "Hair and Scalp", "Scalp care before and after"],
  ["Jaw waxing", "Waxing", "Jaw waxing before and after"],
  ["Hyperpigmentation care", "Body Treatments", "Facial hyperpigmentation treatment before and after"],
];

const galleryImages = treatments.map(([title, category, alt], index) => ({
  src: `/gallery/gallery-${String(index + 1).padStart(2, "0")}.jpeg`,
  title,
  category,
  alt,
}));

const categories = ["All Results", ...new Set(galleryImages.map(({ category }) => category))];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All Results");
  const visibleImages = useMemo(
    () => activeCategory === "All Results" ? galleryImages : galleryImages.filter(({ category }) => category === activeCategory),
    [activeCategory],
  );

  return (
    <main className="dsc-gallery-page">
      <section className="dsc-gallery-hero">
        <div className="dsc-gallery-hero-content">
          <span className="dsc-gallery-eyebrow">THE DSC GALLERY</span>
          <h1>A closer look at <em>our work.</em></h1>
          <p>Explore selected treatment results from De Skin Culture Spa. Every client’s skin and smile is unique, so results can vary.</p>
        </div>
        <div className="dsc-gallery-hero-image"><img src="/spa.png" alt="A guest enjoying a spa treatment" /></div>
      </section>
      <section className="dsc-gallery-filter-section" aria-label="Gallery categories">
        <div className="dsc-gallery-filter-heading"><span>EXPLORE</span><h2>Gallery</h2><p>{visibleImages.length} results</p></div>
        <div className="dsc-gallery-filter" role="group" aria-label="Filter gallery by category">
          {categories.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} className={activeCategory === category ? "dsc-gallery-filter-active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}
        </div>
      </section>
      <section className="dsc-gallery-grid" aria-label={`${activeCategory} gallery results`}>
        {visibleImages.map(({ src, title, category, alt }, index) => (
          <article className="dsc-gallery-card" key={src}>
            <img src={src} alt={alt} loading={index < 6 ? "eager" : "lazy"} />
            <div className="dsc-gallery-card-caption"><span>{category}</span><h3>{title}</h3></div>
          </article>
        ))}
      </section>
      <section className="dsc-gallery-cta">
        <div><span>YOUR JOURNEY STARTS HERE</span><h2>Want to talk through your skin goals?</h2></div>
        <Link href="/customer/consultation">Explore consultations <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
