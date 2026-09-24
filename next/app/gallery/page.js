"use client";

import { useState } from "react";
import Link from "next/link";

import "./styles/xxl.css";


const galleryItems = [
    {
        id: 1,
        category: "Facial Treatment",
        treatment: "Acne Treatment",
        title: "Acne Treatment Journey",
        description:
            "A targeted skincare treatment focused on improving the appearance of acne-prone skin and supporting a healthier-looking complexion.",
        before: "/images/gallery/acne-before.jpg",
        after: "/images/gallery/acne-after.jpg",
        duration: "12 Weeks"
    },
    {
        id: 2,
        category: "Facial Treatment",
        treatment: "Brightening Facial",
        title: "Skin Brightening",
        description:
            "A personalized facial treatment designed to improve the appearance of uneven tone and restore a fresh, radiant look.",
        before: "/images/gallery/brightening-before.jpg",
        after: "/images/gallery/brightening-after.jpg",
        duration: "6 Weeks"
    },
    {
        id: 3,
        category: "Body Treatment",
        treatment: "Body Treatment",
        title: "Body Skin Renewal",
        description:
            "A body treatment focused on exfoliation, hydration, and improving the overall appearance and texture of the skin.",
        before: "/images/gallery/body-before.jpg",
        after: "/images/gallery/body-after.jpg",
        duration: "8 Weeks"
    },
    {
        id: 4,
        category: "Facial Treatment",
        treatment: "Barrier Repair Facial",
        title: "Barrier Repair",
        description:
            "A gentle treatment routine focused on supporting the skin barrier and improving the appearance of dry, stressed skin.",
        before: "/images/gallery/barrier-before.jpg",
        after: "/images/gallery/barrier-after.jpg",
        duration: "8 Weeks"
    },
    {
        id: 5,
        category: "Body Treatment",
        treatment: "Spot Treatment",
        title: "Body Spot Treatment",
        description:
            "A targeted treatment designed to improve the appearance of uneven pigmentation and visible body spots.",
        before: "/images/gallery/spot-before.jpg",
        after: "/images/gallery/spot-after.jpg",
        duration: "10 Weeks"
    },
    {
        id: 6,
        category: "Advanced Treatment",
        treatment: "Microneedling",
        title: "Skin Texture Treatment",
        description:
            "A professional treatment designed to support smoother-looking skin and improve the appearance of uneven texture.",
        before: "/images/gallery/microneedling-before.jpg",
        after: "/images/gallery/microneedling-after.jpg",
        duration: "12 Weeks"
    }
];


const categories = [
    "All Results",
    "Facial Treatment",
    "Body Treatment",
    "Advanced Treatment"
];


export default function GalleryPage() {

    const [activeCategory, setActiveCategory] =
        useState("All Results");

    const [selectedResult, setSelectedResult] =
        useState(null);


    const filteredItems =
        activeCategory === "All Results"
            ? galleryItems
            : galleryItems.filter(
                (item) =>
                    item.category === activeCategory
            );


    return (
        <main className="dsc-gallery-page">


            {/* =====================================================
                HERO
            ====================================================== */}

            <section className="dsc-gallery-hero">

                <div className="dsc-gallery-hero-content">

                    <span className="dsc-gallery-eyebrow">
                        REAL RESULTS
                    </span>

                    <h1>
                        Results worth
                        <br />
                        <em>seeing.</em>
                    </h1>

                    <p>
                        Explore real treatment journeys from
                        De Skin Culture. Browse before-and-after
                        results and discover what personalized
                        skincare can look like.
                    </p>

                </div>


                <div className="dsc-gallery-hero-side">

                    <span>
                        01
                    </span>

                    <p>
                        BEFORE
                        <br />
                        & AFTER
                    </p>

                </div>

            </section>


            {/* =====================================================
                INTRO
            ====================================================== */}

            <section className="dsc-gallery-intro">

                <div className="dsc-gallery-intro-label">

                    <span>
                        OUR RESULTS
                    </span>

                </div>


                <div className="dsc-gallery-intro-content">

                    <h2>
                        Your journey is
                        <br />
                        <em>personal.</em>
                    </h2>

                    <p>
                        Every treatment begins with understanding
                        the individual. The results shown here
                        represent treatment journeys and are
                        provided for educational and illustrative
                        purposes.
                    </p>

                </div>

            </section>


            {/* =====================================================
                CATEGORY FILTER
            ====================================================== */}

            <section className="dsc-gallery-filter-section">

                <div className="dsc-gallery-filter-heading">

                    <span>
                        EXPLORE RESULTS
                    </span>

                    <h2>
                        Treatment evidence
                    </h2>

                </div>


                <div className="dsc-gallery-filter">

                    {categories.map((category) => (

                        <button
                            key={category}
                            type="button"
                            className={
                                activeCategory === category
                                    ? "dsc-gallery-filter-active"
                                    : ""
                            }
                            onClick={() =>
                                setActiveCategory(category)
                            }
                        >
                            {category}
                        </button>

                    ))}

                </div>

            </section>


            {/* =====================================================
                FEATURED RESULT
            ====================================================== */}

            {filteredItems.length > 0 && (

                <section className="dsc-gallery-featured">

                    <div className="dsc-gallery-featured-media">

                        <div className="dsc-gallery-before">

                            <img
                                src={filteredItems[0].before}
                                alt={`${filteredItems[0].treatment} before treatment`}
                            />

                            <span>
                                BEFORE
                            </span>

                        </div>


                        <div className="dsc-gallery-after">

                            <img
                                src={filteredItems[0].after}
                                alt={`${filteredItems[0].treatment} after treatment`}
                            />

                            <span>
                                AFTER
                            </span>

                        </div>

                    </div>


                    <div className="dsc-gallery-featured-content">

                        <span className="dsc-gallery-result-label">
                            FEATURED RESULT
                        </span>

                        <h2>
                            {filteredItems[0].title}
                        </h2>

                        <div className="dsc-gallery-featured-meta">

                            <span>
                                {filteredItems[0].treatment}
                            </span>

                            <span>
                                {filteredItems[0].duration}
                            </span>

                        </div>

                        <p>
                            {filteredItems[0].description}
                        </p>

                        <button
                            type="button"
                            onClick={() =>
                                setSelectedResult(
                                    filteredItems[0]
                                )
                            }
                        >
                            View Full Result
                            <span>
                                →
                            </span>
                        </button>

                    </div>

                </section>

            )}


            {/* =====================================================
                RESULTS GRID
            ====================================================== */}

            <section className="dsc-gallery-results">

                <div className="dsc-gallery-results-heading">

                    <span>
                        MORE TRANSFORMATIONS
                    </span>

                    <p>
                        {filteredItems.length} results
                    </p>

                </div>


                <div className="dsc-gallery-grid">

                    {filteredItems.map((item, index) => {

                        if (index === 0) {
                            return null;
                        }

                        return (

                            <article
                                className="dsc-gallery-card"
                                key={item.id}
                            >

                                <div className="dsc-gallery-card-images">

                                    <div>
                                        <img
                                            src={item.before}
                                            alt={`${item.title} before`}
                                        />

                                        <span>
                                            BEFORE
                                        </span>
                                    </div>


                                    <div>
                                        <img
                                            src={item.after}
                                            alt={`${item.title} after`}
                                        />

                                        <span>
                                            AFTER
                                        </span>
                                    </div>

                                </div>


                                <div className="dsc-gallery-card-content">

                                    <span>
                                        {item.category}
                                    </span>

                                    <h3>
                                        {item.title}
                                    </h3>

                                    <p>
                                        {item.description}
                                    </p>

                                    <div className="dsc-gallery-card-footer">

                                        <small>
                                            {item.duration}
                                        </small>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedResult(item)
                                            }
                                        >
                                            View Result →
                                        </button>

                                    </div>

                                </div>

                            </article>

                        );

                    })}

                </div>

            </section>


            {/* =====================================================
                CTA
            ====================================================== */}

            <section className="dsc-gallery-cta">

                <div>

                    <span>
                        YOUR JOURNEY STARTS HERE
                    </span>

                    <h2>
                        Ready to work on
                        your skin goals?
                    </h2>

                </div>

                <Link href="consultation">
                    Book a Consultation →
                </Link>

            </section>


            {/* =====================================================
                RESULT MODAL
            ====================================================== */}

            {selectedResult && (

                <div
                    className="dsc-gallery-modal-overlay"
                    onClick={() =>
                        setSelectedResult(null)
                    }
                >

                    <div
                        className="dsc-gallery-modal"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <button
                            type="button"
                            className="dsc-gallery-modal-close"
                            onClick={() =>
                                setSelectedResult(null)
                            }
                        >
                            ×
                        </button>


                        <div className="dsc-gallery-modal-images">

                            <div>

                                <img
                                    src={selectedResult.before}
                                    alt={`${selectedResult.title} before`}
                                />

                                <span>
                                    BEFORE
                                </span>

                            </div>


                            <div>

                                <img
                                    src={selectedResult.after}
                                    alt={`${selectedResult.title} after`}
                                />

                                <span>
                                    AFTER
                                </span>

                            </div>

                        </div>


                        <div className="dsc-gallery-modal-content">

                            <span>
                                {selectedResult.category}
                            </span>

                            <h2>
                                {selectedResult.title}
                            </h2>

                            <p>
                                {selectedResult.description}
                            </p>

                            <small>
                                Treatment period:{" "}
                                {selectedResult.duration}
                            </small>

                        </div>

                    </div>

                </div>

            )}

        </main>
    );
}