import Link from "next/link";
import _SERVICES from "../../src/json/services.json";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

const categoryImages = ["/spa.png", "/bg.jpeg", "/m.jpg", "/appointment.png"];

export default function Services() {
  const categories = (_SERVICES.categories || []).filter(
    ({ category }) => category.toLowerCase() !== "consultation",
  );

  return (
    <main className="services-catalog">
      <section className="services-catalog-inner" aria-labelledby="services-title">
        <div className="catalog-eyebrow"><span aria-hidden="true">✳</span> THOUGHTFUL CARE, MADE FOR YOU</div>
        <h1 id="services-title">Find the treatment that feels right.</h1>
        <p className="catalog-intro">Explore our range of skin, body and beauty treatments, each delivered with care by our team.</p>

        <div className="catalog-list" aria-label="Treatment categories">
          {categories.map(({ category, subcategories }, index) => {
            const slug = category.toLowerCase().trim().replace(/\s+/g, "-");
            return (
              <Link
                className="catalog-card service-catalog-card"
                href={`/services/${slug}`}
                key={category}
                style={{ "--catalog-image": `url('${categoryImages[index % categoryImages.length]}')` }}
              >
                <span className="catalog-card-count">{String(index + 1).padStart(2, "0")}</span>
                <span className="catalog-card-copy">
                  <span className="catalog-card-title">{category}</span>
                  <span className="catalog-card-detail">{subcategories.length} {subcategories.length === 1 ? "treatment" : "treatments"}</span>
                </span>
                <span className="catalog-card-arrow" aria-hidden="true">↗</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
