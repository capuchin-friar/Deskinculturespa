"use client";

import Link from "next/link";
import useServiceHandler from "../../src/hooks/service";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

function slugify(category) {
  return String(category || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

function groupCategories(services) {
  const groups = new Map();
  for (const service of services) {
    if (service?.is_active === false) continue;
    const category = String(service.category || "").trim();
    if (!category || category.toLowerCase() === "consultation") continue;
    const current = groups.get(category) || { category, services: [] };
    current.services.push(service);
    groups.set(category, current);
  }

  return [...groups.values()].map((group) => ({
    category: group.category,
    slug: slugify(group.category),
    count: group.services.length,
    image: group.services.map((service) => service.image_url).find(Boolean) || "",
  }));
}

export default function Services() {
  const { services, loading } = useServiceHandler();
  const categories = groupCategories(Array.isArray(services) ? services : []);

  return (
    <main className="services-catalog">
      <section className="services-catalog-inner" aria-labelledby="services-title">
        <div className="catalog-eyebrow"><span aria-hidden="true">✳</span> THOUGHTFUL CARE, MADE FOR YOU</div>
        <h1 id="services-title">Find the treatment that feels right.</h1>
        <p className="catalog-intro">Explore our range of skin, body and beauty treatments, each delivered with care by our team.</p>

        <div className="catalog-list" aria-label="Treatment categories">
          {loading ? (
            <p className="catalog-intro">Loading treatments…</p>
          ) : categories.length === 0 ? (
            <p className="catalog-intro">No treatments are listed yet.</p>
          ) : (
            categories.map(({ category, slug, count, image }, index) => (
              <Link
                className="catalog-card service-catalog-card"
                href={`/services/${slug}`}
                key={slug}
                style={image ? { "--catalog-image": `url('${image}')` } : undefined}
              >
                <span className="catalog-card-count">{String(index + 1).padStart(2, "0")}</span>
                <span className="catalog-card-copy">
                  <span className="catalog-card-title">{category}</span>
                  <span className="catalog-card-detail">{count} {count === 1 ? "treatment" : "treatments"}</span>
                </span>
                <span className="catalog-card-arrow" aria-hidden="true">↗</span>
              </Link>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
