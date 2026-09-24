"use client";

import { useRouter } from "next/navigation";
import "./styles/xxl.css";
import { useEffect, useMemo, useState } from "react";
import Formatter from "../../src/utils/formatter";
import useToggler from "../../src/hooks/toggler";
import { useSelector } from "react-redux";

export default function Store() {
    const { filters } = useSelector((s) => s.filters);

    const router = useRouter();

    // const [packages, setPackages] = useState([]);
    const [packages, setPackages] = useState(dummyPackages);
    const [filteredPackages, setFilteredPackages] = useState([]);
    const [activeCategory, setActiveCategory] = useState("all");

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();

    /*
     * Available package categories.
     * These should correspond to the category values
     * stored on your package objects.
     */
    const categories = [
        {
            id: "all",
            name: "All Packages"
        },
        {
            id: "skincare",
            name: "Skincare"
        },
        {
            id: "body-care",
            name: "Body Care"
        },
        {
            id: "massage",
            name: "Massage"
        },
        {
            id: "bridal",
            name: "Bridal"
        },
        {
            id: "wellness",
            name: "Wellness"
        }
    ];

    /*
     * Existing Redux filters + the new category filter.
     */
    useEffect(() => {
        implementFilter(filters);
    }, [filters, packages, activeCategory]);

    function implementFilter(filter) {
        let filtered = [...packages];

        /*
         * Existing price filter
         */
        if (filter?.price) {
            filtered = filtered.filter((p) => {
                const price = Number(p.price || 0);

                const min = Number(filter.price.min || 0);
                const max = Number(
                    filter.price.max || Number.MAX_SAFE_INTEGER
                );

                return price >= min && price <= max;
            });
        }

        /*
         * Existing Redux category filter
         */
        if (filter?.category && filter.category !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.category?.toLowerCase() ===
                    filter.category.toLowerCase()
            );
        }

        /*
         * Existing Redux sub-category filter
         */
        if (filter?.subCategory && filter.subCategory !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.subcategory?.toLowerCase() ===
                    filter.subCategory.toLowerCase()
            );
        }

        /*
         * Existing brand filter
         */
        if (filter?.brand && filter.brand !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.brand?.toLowerCase() ===
                    filter.brand.toLowerCase()
            );
        }

        /*
         * New visual category filter
         */
        if (activeCategory !== "all") {
            filtered = filtered.filter((p) => {
                const category = p.category?.toLowerCase();
                const subCategory = p.subcategory?.toLowerCase();

                return (
                    category === activeCategory.toLowerCase() ||
                    subCategory === activeCategory.toLowerCase()
                );
            });
        }

        setFilteredPackages(filtered);
    }

    function handleClick(p) {
        router.push(`/packages/${p.id}`);
    }

    async function handleCartClick(e, p) {
        /*
         * Prevent clicking the cart button from
         * triggering the card navigation.
         */
        e.stopPropagation();

        const isPackageCarted = isCarted(p.id);

        if (isPackageCarted) {
            await rmFromCart(p.id);
        } else {
            await addToCart({
                item: p,
                qty: 1
            });
        }
    }

    function formatPrice(price) {
        if (!price) return "₦0";

        return `₦${Formatter.formatRevenue(price)}`;
    }

    function getDuration(packageItem) {
        if (packageItem.duration) {
            return packageItem.duration;
        }

        if (packageItem.duration_months) {
            return `${packageItem.duration_months} months`;
        }

        if (
            packageItem.name
                ?.toLowerCase()
                .includes("3-month")
        ) {
            return "3 months";
        }

        return "Single session";
    }

    return (
        <div className="customer-store">

            {/* ================================
                PAGE HEADER
            ================================= */}

            {/* <section className="customer-store-header">

                <div className="customer-store-header-content">

                    <span className="customer-store-eyebrow">
                        SPA PACKAGES
                    </span>

                    <h1>
                        Complete care for your
                        <br />
                        skin and body
                    </h1>

                    <p>
                        Thoughtfully designed spa packages to help you
                        look good, feel refreshed and stay consistent
                        on your self-care journey.
                    </p>

                </div>

            </section> */}


            {/* ================================
                PACKAGE FILTER
            ================================= */}

            <section className="customer-store-filter">

                <div className="customer-store-filter-inner">

                    <div className="customer-store-filter-scroll">

                        {categories.map((category) => (
                            <button
                                key={category.id}
                                type="button"
                                className={`package-filter-button ${
                                    activeCategory === category.id
                                        ? "active"
                                        : ""
                                }`}
                                onClick={() =>
                                    setActiveCategory(category.id)
                                }
                            >
                                {category.name}
                            </button>
                        ))}

                    </div>

                </div>

            </section>


            {/* ================================
                PACKAGE CARDS
            ================================= */}

            <section className="customer-store-package-card-cnt">

                {filteredPackages.length > 0 ? (

                    filteredPackages.map((p) => (

                        <article
                            className="customer-store-package-card"
                            key={p.id}
                            onClick={() => handleClick(p)}
                        >

                            {/* IMAGE */}

                            <div
                                className="customer-store-package-thumbnail"
                                style={{
                                    backgroundImage: `url(${p.thumbnail_url})`
                                }}
                            >

                                {p.isPopular && (
                                    <span className="package-popular-badge">
                                        Popular
                                    </span>
                                )}

                                <div className="package-image-overlay" />

                            </div>


                            {/* CARD CONTENT */}

                            <div className="customer-store-package-body">

                                <div className="customer-store-package-content">

                                    <h2 className="customer-store-package-title">
                                        {p.name || "Package title"}
                                    </h2>

                                    <p className="customer-store-package-description">
                                        {p.description ||
                                            "A carefully designed spa experience created to support your skin, body and overall wellbeing."}
                                    </p>

                                </div>


                                {/* META */}

                                <div className="customer-store-package-meta">

                                    <div className="package-duration">

                                        <span className="package-meta-icon">
                                            ◷
                                        </span>

                                        <span>
                                            {getDuration(p)}
                                        </span>

                                    </div>

                                </div>


                                {/* PRICE */}

                                <div className="customer-store-package-footer">

                                    <div className="customer-store-package-price">
                                        {formatPrice(p.price)}
                                    </div>

                                    <button
                                        type="button"
                                        className="package-view-button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleClick(p);
                                        }}
                                    >
                                        View Details
                                        <span>→</span>
                                    </button>

                                </div>

                            </div>

                        </article>

                    ))

                ) : (

                    <div className="customer-store-empty">

                        <div className="customer-store-empty-icon">
                            ✦
                        </div>

                        <h3>
                            No packages found
                        </h3>

                        <p>
                            We couldn't find any packages matching
                            your selected category.
                        </p>

                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                        >
                            View all packages
                        </button>

                    </div>

                )}

            </section>

        </div>
    );
}

const dummyPackages = [
  {
    id: "acne-treatment-3-month",
    name: "3-Month Acne Treatment Plan",
    description:
      "A structured 3-month program for clients dealing with active acne, clogged pores, breakouts and post-acne marks. Includes personalized treatments, professional extractions, acne-focused facials and progress monitoring.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    price: 90000,
    duration: "3 months",
    duration_months: 3,
    category: "skincare",
    subcategory: "acne",
    isPopular: true
  },

  {
    id: "glow-skin-renewal-3-month",
    name: "3-Month Glow & Skin Renewal Plan",
    description:
      "A rejuvenating skin program designed for dull, tired-looking, uneven and dehydrated skin. Includes glow-focused facials, gentle exfoliation, hydration treatments, LED therapy and personalized product recommendations.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85",
    price: 65000,
    duration: "3 months",
    duration_months: 3,
    category: "skincare",
    subcategory: "skin-renewal",
    isPopular: false
  },

  {
    id: "chemical-peel-3-month",
    name: "3-Month Chemical Peel Plan",
    description:
      "A professionally guided chemical peel program designed to target acne, hyperpigmentation, uneven skin tone and texture. Treatments are selected according to your skin needs with appropriate preparation, aftercare and progress monitoring.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    price: 190000,
    max_price: 270000,
    duration: "3 months",
    duration_months: 3,
    category: "skincare",
    subcategory: "chemical-peel",
    isPopular: true
  },

  {
    id: "microneedling-3-month",
    name: "3-Month Microneedling Plan",
    description:
      "A structured skin-renewal program created to improve the appearance of acne scars, uneven texture and enlarged pores. Includes scheduled microneedling sessions, supportive treatments, personalized aftercare and progress monitoring.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=900&q=85",
    price: 190000,
    max_price: 270000,
    duration: "3 months",
    duration_months: 3,
    category: "skincare",
    subcategory: "microneedling",
    isPopular: false
  },

  {
    id: "glow-relax-package",
    name: "Glow & Relax Package",
    description:
      "A relaxing combination of body care and face glow-focused treatments designed to help you feel refreshed, relaxed and radiant. A perfect package for clients looking to combine skin rejuvenation with a calming spa experience.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=900&q=85",
    price: 60000,
    max_price: 80000,
    duration: "Single session",
    category: "wellness",
    subcategory: "relaxation",
    isPopular: true
  },

  {
    id: "massage-3-month",
    name: "3-Month Massage Plan",
    description:
      "A personalized massage experience focused on relaxation, muscle tension and overall body comfort. Choose from relaxation massage, deep tissue massage, full body massage or targeted back, neck and shoulder massage sessions.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    price: 75000,
    max_price: 105000,
    duration: "3 months",
    duration_months: 3,
    category: "massage",
    subcategory: "massage",
    isPopular: false
  },

  {
    id: "body-glow-plan",
    name: "Body Glow Plan",
    description:
      "A complete body-care experience designed to leave your skin feeling smooth, soft and radiant from head to toe. Includes full body exfoliation, body polish, hydration treatments and targeted care for rough or uneven areas.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=900&q=85",
    price: 100000,
    duration: "Single session",
    category: "body-care",
    subcategory: "body-glow",
    isPopular: false
  },

  {
    id: "stress-relief-package",
    name: "Stress Relief Package",
    description:
      "Pause, breathe and relax with a calming spa experience created for clients who need to step away from everyday stress. Includes a relaxation massage, body treatment and a dedicated relaxation-focused spa session.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=900&q=85",
    price: 120000,
    max_price: 150000,
    duration: "Single session",
    category: "wellness",
    subcategory: "stress-relief",
    isPopular: false
  },

  {
    id: "luxury-spa-package",
    name: "Luxury Spa Package",
    description:
      "Your complete self-care experience combining premium body, skin and relaxation treatments. Designed for clients who want a full spa experience including massage, body glow treatment, facial, body polish and a dedicated relaxation session.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    price: 140000,
    max_price: 200000,
    duration: "Single session",
    category: "wellness",
    subcategory: "luxury",
    isPopular: true
  },

  {
    id: "bridal-glow-package",
    name: "Bridal Glow Package",
    description:
      "A personalized bridal skincare and body-care experience designed to help you look and feel your best before your wedding. Includes a bridal facial, body polish, hydration treatment, waxing where required and pre-event skincare guidance.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=85",
    price: 120000,
    max_price: 200000,
    duration: "Bridal package",
    category: "bridal",
    subcategory: "bridal-glow",
    isPopular: true
  },

  {
    id: "deep-relaxation-massage",
    name: "Deep Relaxation Massage",
    description:
      "A calming massage experience designed to release everyday tension and encourage deep relaxation. Ideal for clients looking for dedicated time to unwind while receiving focused attention on areas of muscular tension and discomfort.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=900&q=85",
    price: 45000,
    duration: "60 minutes",
    category: "massage",
    subcategory: "relaxation",
    isPopular: false
  },

  {
    id: "hydration-facial",
    name: "Deep Hydration Facial",
    description:
      "A refreshing facial treatment designed for dry, dehydrated and tired-looking skin. The treatment focuses on restoring moisture, improving skin comfort and leaving your complexion looking softer, smoother and more refreshed.",
    thumbnail_url:
      "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=900&q=85",
    price: 35000,
    duration: "60 minutes",
    category: "skincare",
    subcategory: "facial",
    isPopular: false
  }
];