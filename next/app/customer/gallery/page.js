"use client";

import { useState } from "react";
import Link from "next/link";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const categories = ["All Results", "Facial Treatment", "Body Treatment", "Advanced Treatment"];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All Results");

  return (
    <main className="dsc-gallery-page">
      <section className="dsc-gallery-hero">
        <div className="dsc-gallery-hero-content">
          <span className="dsc-gallery-eyebrow">THE DSC GALLERY</span>
          <h1>A closer look at <em>our work.</em></h1>
          <p>Explore the De Skin Culture experience through our gallery.</p>
        </div>
        <div className="dsc-gallery-hero-image"><img src="/spa.png" alt="A guest enjoying a spa treatment" /></div>
      </section>
      <section className="dsc-gallery-filter-section" aria-label="Gallery categories">
        <div className="dsc-gallery-filter-heading"><span>EXPLORE</span><h2>Gallery</h2></div>
        <div className="dsc-gallery-filter" role="group" aria-label="Filter gallery by category">
          {categories.map((category) => <button key={category} type="button" aria-pressed={activeCategory === category} className={activeCategory === category ? "dsc-gallery-filter-active" : ""} onClick={() => setActiveCategory(category)}>{category}</button>)}
        </div>
      </section>
      <section className="dsc-gallery-empty" aria-live="polite">
        <span className="dsc-gallery-empty-mark" aria-hidden="true">DSC</span>
        <span className="dsc-gallery-result-label">{activeCategory === "All Results" ? "OUR GALLERY" : activeCategory.toUpperCase()}</span>
        <h2>Gallery images will appear here.</h2>
        <p>There are no published images in this collection yet. Please check back soon.</p>
      </section>
      <section className="dsc-gallery-cta">
        <div><span>YOUR JOURNEY STARTS HERE</span><h2>Want to talk through your skin goals?</h2></div>
        <Link href="/customer/consultation">Explore consultations <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
