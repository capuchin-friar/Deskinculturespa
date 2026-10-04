"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const galleryImages = [
  { file: "gallery-01.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-02.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-03.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-04.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-05.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Dental tartar removal before and after" },
  { file: "gallery-06.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-07.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-08.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-09.jpeg", title: "Tartar removal and whitening", category: "Teeth Whitening", alt: "Dental treatment sequence showing tartar removal and teeth whitening" },
  { file: "gallery-10.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-11.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-12.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-13.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-14.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-15.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
  { file: "gallery-16.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-17.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-18.jpeg", title: "Chemical burn care", category: "Body Treatments", alt: "Foot care treatment before and after" },
  { file: "gallery-19.jpeg", title: "Hyperpigmentation care", category: "Body Treatments", alt: "Foot hyperpigmentation treatment before and after" },
  { file: "gallery-20.jpeg", title: "Dark knuckle care", category: "Knuckles Treatment", alt: "Hand treatment before and after" },
  { file: "gallery-21.jpeg", title: "Manicure", category: "Pedicures", alt: "Hand manicure result" },
  { file: "gallery-22.jpeg", title: "Dark knuckle care", category: "Knuckles Treatment", alt: "Dark knuckle treatment progress" },
  { file: "gallery-23.jpeg", title: "Laser scar care", category: "Advanced Treatment", alt: "Laser scar treatment before and after" },
  { file: "gallery-24.jpeg", title: "Laser scar care", category: "Advanced Treatment", alt: "Laser scar treatment before and after" },
  { file: "gallery-25.jpeg", title: "Underarm waxing", category: "Waxing", alt: "Underarm waxing before and after" },
  { file: "gallery-26.jpeg", title: "Underarm waxing", category: "Waxing", alt: "Underarm waxing before and after" },
  { file: "gallery-27.jpeg", title: "Underarm waxing", category: "Waxing", alt: "Underarm waxing before and after" },
  { file: "gallery-28.jpeg", title: "Underarm waxing", category: "Waxing", alt: "Underarm waxing before and after" },
  { file: "gallery-29.jpeg", title: "Underarm waxing", category: "Waxing", alt: "Underarm waxing before and after" },
  { file: "gallery-30.jpeg", title: "Foot care", category: "Pedicures", alt: "Foot care result before and after" },
  { file: "gallery-31.jpeg", title: "Pedicure", category: "Pedicures", alt: "Pedicure result before and after" },
  { file: "gallery-32.jpeg", title: "Scalp treatment", category: "Advanced Treatment", alt: "Scalp treatment before and after" },
  { file: "gallery-33.jpeg", title: "Jaw waxing", category: "Waxing", alt: "Jaw waxing before and after" },
  { file: "gallery-34.jpeg", title: "Facial hyperpigmentation care", category: "Facial Treatment", alt: "Facial hyperpigmentation treatment before and after" },
  { file: "gallery-35.jpeg", title: "Facial polish", category: "Facial Treatment", alt: "Facial polish treatment before and after" },
  { file: "gallery-36.jpeg", title: "Facial treatment", category: "Facial Treatment", alt: "Facial treatment result after one session" },
  { file: "gallery-37.jpeg", title: "Acne facial", category: "Facial Treatment", alt: "Acne facial treatment before and after" },
  { file: "gallery-38.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Facial acne treatment before and after" },
  { file: "gallery-39.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-40.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-41.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment result" },
  { file: "gallery-42.jpeg", title: "Acne and dark spots treatment", category: "Facial Treatment", alt: "Acne and dark spots treatment before and after" },
  { file: "gallery-43.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-44.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-45.jpeg", title: "Acne and dark spots treatment", category: "Facial Treatment", alt: "Acne and dark spots treatment before and after" },
  { file: "gallery-46.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-47.jpeg", title: "Dark spot treatment", category: "Facial Treatment", alt: "Dark spot treatment before and after" },
  { file: "gallery-48.jpeg", title: "Facial treatment", category: "Facial Treatment", alt: "Facial treatment before and after" },
  { file: "gallery-49.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment result" },
  { file: "gallery-50.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-51.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-52.jpeg", title: "Acne and spots treatment", category: "Facial Treatment", alt: "Acne and spots treatment before and after" },
  { file: "gallery-53.jpeg", title: "Wrinkle treatment", category: "Facial Treatment", alt: "Wrinkle treatment before and after" },
  { file: "gallery-54.jpeg", title: "Acne and spots treatment", category: "Facial Treatment", alt: "Acne and spots treatment before and after" },
  { file: "gallery-55.jpeg", title: "Skin tag removal", category: "Advanced Treatment", alt: "Skin tag removal before and after" },
  { file: "gallery-56.jpeg", title: "Acne and hyperpigmentation treatment", category: "Facial Treatment", alt: "Acne and hyperpigmentation treatment before and after" },
  { file: "gallery-57.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-58.jpeg", title: "Face and neck treatment", category: "Facial Treatment", alt: "Face and neck treatment before and after" },
  { file: "gallery-59.jpeg", title: "Facial treatment", category: "Facial Treatment", alt: "Facial treatment before and after" },
  { file: "gallery-60.jpeg", title: "Acne treatment", category: "Facial Treatment", alt: "Acne treatment before and after" },
  { file: "gallery-61.jpeg", title: "Dark face and neck treatment", category: "Facial Treatment", alt: "Face and neck treatment before and after" },
  { file: "gallery-62.jpeg", title: "Facial treatment", category: "Facial Treatment", alt: "Facial treatment results" },
  { file: "gallery-63.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-64.jpeg", title: "Tartar removal and whitening", category: "Teeth Whitening", alt: "Dental treatment sequence showing tartar removal and teeth whitening" },
  { file: "gallery-65.jpeg", title: "Tartar removal and whitening", category: "Teeth Whitening", alt: "Tartar removal followed by teeth whitening" },
  { file: "gallery-66.jpeg", title: "Teeth whitening", category: "Teeth Whitening", alt: "Teeth whitening before and after" },
  { file: "gallery-67.jpeg", title: "Tartar removal", category: "Teeth Whitening", alt: "Tartar removal before and after" },
].map(({ file, ...image }) => ({ src: `/gallery-assets/${file}`, ...image }));

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
