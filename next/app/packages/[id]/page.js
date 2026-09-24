"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import "./styles/xxl.css";

import Formatter from "../../../src/utils/formatter";
import useToggler from "../../../src/hooks/toggler";

const packages = [
    {
        id: "acne-treatment-3-month",
        name: "3-Month Acne Treatment Plan",
        description:
            "A structured 3-month program for clients dealing with active acne, clogged pores, breakouts and post-acne marks.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=90",
        price: 90000,
        duration: "3 months",
        category: "skincare",
        subcategory: "acne",
        isPopular: true,
        includes: [
            "Skin consultation and assessment",
            "Personalized acne treatments",
            "Professional extractions where suitable",
            "Acne-focused facials",
            "LED therapy where appropriate",
            "Product recommendations",
            "Progress monitoring"
        ],
        overview:
            "A structured treatment journey designed to help clients manage active acne, clogged pores, breakouts and post-acne marks. Your treatment plan is tailored to your skin condition and adjusted as your skin progresses throughout the program.",
        
    },

    {
        id: "glow-skin-renewal-3-month",
        name: "3-Month Glow & Skin Renewal Plan",
        description:
            "A rejuvenating program for dull, tired-looking, uneven and dehydrated skin.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=90",
        price: 65000,
        duration: "3 months",
        category: "skincare",
        subcategory: "skin-renewal",
        isPopular: false,
        includes: [
            "Skin assessment",
            "Glow-focused facials",
            "Gentle exfoliation",
            "Hydration treatments",
            "LED therapy where suitable",
            "Personalized product recommendations"
        ],
        overview:
            "A carefully structured skin-renewal program created for dull, tired-looking and dehydrated skin. The treatment combines professional facial care, hydration and gentle exfoliation to support a brighter and healthier-looking complexion.",
      
    },

    {
        id: "chemical-peel-3-month",
        name: "3-Month Chemical Peel Plan",
        description:
            "A professionally selected chemical peel program designed to target acne, hyperpigmentation, uneven tone and texture.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1200&q=90",
        price: 190000,
        max_price: 270000,
        duration: "3 months",
        category: "skincare",
        subcategory: "chemical-peel",
        isPopular: true,
        includes: [
            "Skin assessment",
            "Professionally selected peel treatments",
            "Pre-treatment skincare guidance",
            "Post-treatment skincare guidance",
            "Progress monitoring"
        ],
        overview:
            "A structured professional peel program designed around your individual skin concerns. Treatment intensity and product selection are determined according to your skin condition, treatment goals and professional assessment.",
      
    },

    {
        id: "microneedling-3-month",
        name: "3-Month Microneedling Plan",
        description:
            "A structured skin-renewal program designed to improve the appearance of acne scars, uneven texture and enlarged pores.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=1200&q=90",
        price: 190000,
        max_price: 270000,
        duration: "3 months",
        category: "skincare",
        subcategory: "microneedling",
        isPopular: false,
        includes: [
            "Skin assessment",
            "Scheduled microneedling sessions",
            "Appropriate supportive treatments",
            "Aftercare guidance",
            "Progress monitoring"
        ],
        overview:
            "A structured skin-renewal program designed around concerns such as acne scars, uneven texture and enlarged pores. Each session is planned according to your skin's condition and treatment goals.",
      
    },

    {
        id: "glow-relax-package",
        name: "Glow & Relax Package",
        description:
            "A relaxing combination of body care and face glow-focused treatments designed to leave you feeling refreshed, relaxed and radiant.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=90",
        price: 60000,
        max_price: 80000,
        duration: "Single session",
        category: "wellness",
        subcategory: "relaxation",
        isPopular: true,
        includes: [
            "Glow-focused facial",
            "Body treatment",
            "Body care session",
            "Relaxation experience"
        ],
        overview:
            "A relaxing combination of body and facial treatments designed for clients who want to take care of their skin while enjoying a calming spa experience.",
    },

    {
        id: "massage-3-month",
        name: "3-Month Massage Plan",
        description:
            "A personalized massage experience focused on relaxation, muscle tension and overall body comfort.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=90",
        price: 75000,
        max_price: 105000,
        duration: "3 months",
        category: "massage",
        subcategory: "massage",
        isPopular: false,
        includes: [
            "Relaxation massage",
            "Deep tissue massage",
            "Full body massage",
            "Back, neck & shoulder massage"
        ],
        overview:
            "Your body deserves a reset. This structured massage program gives you access to personalized massage experiences focused on relaxation, muscle tension and overall body comfort.",
      
    },

    {
        id: "body-glow-plan",
        name: "Body Glow Plan",
        description:
            "A complete body-care experience designed to leave your skin feeling smooth, soft and radiant from head to toe.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=1200&q=90",
        price: 100000,
        duration: "Single session",
        category: "body-care",
        subcategory: "body-glow",
        isPopular: false,
        includes: [
            "Full body exfoliation",
            "Body polish",
            "Hydration treatment",
            "Targeted care for rough or uneven areas"
        ],
        overview:
            "A full body treatment created to refresh, smooth and hydrate the skin from head to toe.",
       
    },

    {
        id: "stress-relief-package",
        name: "Stress Relief Package",
        description:
            "A relaxing spa experience created for clients who need to step away from the stress and simply take care of themselves.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=1200&q=90",
        price: 120000,
        max_price: 150000,
        duration: "Single session",
        category: "wellness",
        subcategory: "stress-relief",
        isPopular: false,
        includes: [
            "Relaxation massage",
            "Body treatment/wash",
            "Relaxation-focused spa session"
        ],
        overview:
            "Pause. Breathe. Relax. This package is designed for clients who need dedicated time away from everyday stress.",
       
    },

    {
        id: "luxury-spa-package",
        name: "Luxury Spa Package",
        description:
            "A premium combination of body, skin and relaxation treatments designed for clients who want the complete DeSkinCultureSpa experience.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=90",
        price: 140000,
        max_price: 200000,
        duration: "Single session",
        category: "wellness",
        subcategory: "luxury",
        isPopular: true,
        includes: [
            "Full body massage",
            "Body glow treatment",
            "Facial",
            "Body polish",
            "Relaxation session"
        ],
        overview:
            "Your full self-care experience. A premium combination of body, skin and relaxation treatments designed for clients who want the complete spa experience.",
      
    },

    {
        id: "bridal-glow-package",
        name: "Bridal Glow Package",
        description:
            "A personalized bridal skincare and body-care program designed to help you look and feel your best before your wedding.",
        thumbnail_url:
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=90",
        price: 120000,
        max_price: 200000,
        duration: "Bridal package",
        category: "bridal",
        subcategory: "bridal-glow",
        isPopular: true,
        includes: [
            "Bridal facial",
            "Body polish",
            "Hydration treatment",
            "Hair removal/waxing where required",
            "Pre-event skincare guidance"
        ],
        overview:
            "Because your skin deserves preparation before the big day. This personalized bridal program is designed to help you look and feel your best before your wedding.",
       
    }
];


export default function PackageDetail() {
    const params = useParams();
    const router = useRouter();

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();

    const [activeImage, setActiveImage] = useState(0);

    const packageItem = packages.find(
        (item) => item.id === params.id
    );

    if (!packageItem) {
        return (
            <main className="package-detail-not-found">
                <h1>Package not found</h1>

                <button
                    onClick={() => router.push("/store")}
                >
                    Back to packages
                </button>
            </main>
        );
    }


    /*
     * Create a small gallery from the primary image.
     * Replace these with package-specific gallery
     * images when they become available from your API.
     */
    const gallery = [
        packageItem.thumbnail_url,
        packageItem.thumbnail_url,
        packageItem.thumbnail_url,
        packageItem.thumbnail_url
    ];


    function formatPrice(price) {
        return `₦${Formatter.formatRevenue(price)}`;
    }


    function getPrice() {
        if (packageItem.max_price) {
            return (
                <>
                    {formatPrice(packageItem.price)}
                    <span className="package-price-range">
                        {" "}–{" "}
                        {formatPrice(packageItem.max_price)}
                    </span>
                </>
            );
        }

        return formatPrice(packageItem.price);
    }


    async function handleCart() {
        const carted = isCarted(packageItem.id);

        if (carted) {
            await rmFromCart(packageItem.id);
        } else {
            await addToCart({
                item: packageItem,
                qty: 1
            });
        }
    }


    function handleBooking() {
        /*
         * Change this route to your actual booking route.
         */
        router.push(
            `/consultation?package=${packageItem.id}`
        );
    }


    return (
        <main className="package-detail-page">

            {/* =====================================
                BREADCRUMB
            ====================================== */}

            <div className="package-detail-container">

                <div className="package-breadcrumb">

                    <button
                        onClick={() => router.push("/store")}
                    >
                        Packages
                    </button>

                    <span>/</span>

                    <span>
                        {packageItem.name}
                    </span>

                </div>


                {/* =====================================
                    HERO / PRODUCT INFORMATION
                ====================================== */}

                <section className="package-detail-hero">

                    {/* IMAGE GALLERY */}

                    <div className="package-gallery">

                        <div className="package-gallery-thumbnails">

                            {gallery.map((image, index) => (

                                <button
                                    key={index}
                                    className={`package-gallery-thumbnail ${
                                        activeImage === index
                                            ? "active"
                                            : ""
                                    }`}
                                    onClick={() =>
                                        setActiveImage(index)
                                    }
                                >
                                    <img
                                        src={image}
                                        alt={`${packageItem.name} ${index + 1}`}
                                    />
                                </button>

                            ))}

                        </div>


                        <div className="package-main-image">

                            <img
                                src={gallery[activeImage]}
                                alt={packageItem.name}
                            />

                            {packageItem.isPopular && (
                                <span className="package-detail-popular">
                                    Popular
                                </span>
                            )}

                        </div>

                    </div>


                    {/* PACKAGE INFORMATION */}

                    <div className="package-detail-information">

                        <span className="package-detail-category">
                            {packageItem.category}
                        </span>

                        <h1>
                            {packageItem.name}
                        </h1>

                        <div className="package-detail-price">
                            {getPrice()}
                        </div>

                        <div className="package-detail-duration">

                            <span className="duration-icon">
                                ◷
                            </span>

                            <div>
                                <span>
                                    Program duration
                                </span>

                                <strong>
                                    {packageItem.duration}
                                </strong>
                            </div>

                        </div>


                        <p className="package-detail-description">
                            {packageItem.description}
                        </p>


                        <div className="package-detail-divider" />

                        {/* ACTIONS */}

                        <div className="package-detail-actions">

                            <button
                                className="package-book-button"
                                onClick={handleBooking}
                            >
                                Book This Package
                                <span>→</span>
                            </button>


                        </div>

                    </div>

                </section>


                {/* =====================================
                    OVERVIEW
                ====================================== */}

                <section className="package-overview-section">

                    <div className="package-section-heading">

                        <span>
                            ABOUT THIS PACKAGE
                        </span>

                        <h2>
                            Designed around your
                            <br />
                            skin & wellness goals
                        </h2>

                    </div>


                    <div className="package-overview-content">

                        <p>
                            {packageItem.overview}
                        </p>

                        <p>
                            Every package is designed to provide
                            a structured and intentional approach
                            to your self-care journey, with
                            recommendations tailored around your
                            individual needs and treatment goals.
                        </p>

                    </div>

                </section>


                {/* =====================================
                    WHAT'S INCLUDED
                ====================================== */}

                <section className="package-includes-section">

                    <div className="package-section-heading">

                        <span>
                            WHAT'S INCLUDED
                        </span>

                        <h2>
                            Everything included
                            <br />
                            in your package
                        </h2>

                    </div>


                    <div className="package-includes-grid">

                        {packageItem.includes.map(
                            (item, index) => (

                                <div
                                    className="package-include-card"
                                    key={index}
                                >

                                    <div className="include-number">
                                        {String(index + 1).padStart(2, "0")}
                                    </div>
                                    &nbsp;
                                    &nbsp;
                                    &nbsp;

                                    <br />

                                    <div>

                                        <span className="include-check">
                                            ✓
                                        </span>

                                        <p>
                                            {item}
                                        </p>

                                    </div>

                                </div>

                            )
                        )}

                    </div>

                </section>


                {/* =====================================
                    FINAL CTA
                ====================================== */}

                <section className="package-detail-cta">

                    <div>

                        <span>
                            DESKINCULTURESPA
                        </span>

                        <h2>
                            Your skin.
                            <br />
                            Your body.
                            <br />
                            Your moment of self-care.
                        </h2>

                    </div>


                    <button
                        onClick={handleBooking}
                    >
                        Book This Package
                        <span>→</span>
                    </button>

                </section>

            </div>

        </main>
    );
}