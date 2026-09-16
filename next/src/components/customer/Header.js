import {
    IoCartOutline,
    IoPersonOutline,
    IoSearchOutline
} from "react-icons/io5";

import Link from "next/link";


export function Header() {

    const offers = [
        {
            products: [
                {
                    id: 1,
                    name: "Lavender Aromatherapy Oil",
                    price: 12000,
                    image: "/images/products/lavender-oil.jpg"
                },
                {
                    id: 2,
                    name: "Shea Butter Body Cream",
                    price: 8500,
                    image: "/images/products/shea-butter.jpg"
                },
                {
                    id: 3,
                    name: "Relaxation Bath Salt",
                    price: 6500,
                    image: "/images/products/bath-salt.jpg"
                },
                {
                    id: 4,
                    name: "Deep Moisture Face Mask",
                    price: 7500,
                    image: "/images/products/face-mask.jpg"
                }
            ]
        },
        {
            services: [
                {
                    id: 1,
                    name: "Full Body Massage",
                    duration: "60 minutes",
                    price: 30000,
                    image: "/images/services/full-body-massage.jpg"
                },
                {
                    id: 2,
                    name: "Facial Treatment",
                    duration: "45 minutes",
                    price: 22000,
                    image: "/images/services/facial-treatment.jpg"
                },
                {
                    id: 3,
                    name: "Aromatherapy Session",
                    duration: "30 minutes",
                    price: 18000,
                    image: "/images/services/aromatherapy.jpg"
                },
                {
                    id: 4,
                    name: "Hot Stone Massage",
                    duration: "90 minutes",
                    price: 45000,
                    image: "/images/services/hot-stone.jpg"
                }
            ]
        },
        {
            appointments: [
                {
                    id: 1,
                    name: "Spa Consultation",
                    mode: "physical",
                    duration: "30 minutes",
                    price: 10000
                },
                {
                    id: 2,
                    name: "Wellness Consultation",
                    mode: "online",
                    duration: "20 minutes",
                    price: 7000
                },
                {
                    id: 3,
                    name: "Skincare Consultation",
                    mode: "physical",
                    duration: "45 minutes",
                    price: 15000
                },
                {
                    id: 4,
                    name: "Virtual Spa Consultation",
                    mode: "online",
                    duration: "30 minutes",
                    price: 9000
                }
            ]
        }
    ];


    const resources = [
        {
            resource: [
                "About Us",
                "Our Story",
                "Blogs",
                "FAQ",
                "Contact Us",
                "Newsletter",
                "Referral Program",
                "Shipping & Returns"
            ]
        }
    ];


    const gallery = [
        {
            gallery: [
                "Treatment Gallery",
                "Before & After",
                "Spa Experience",
                "Facial Treatments",
                "Body Treatments",
                "Massage Sessions"
            ]
        }
    ];


    return (
        <header className="customer-header">

            {/* =========================
                LEFT NAVIGATION
            ========================== */}

            <nav className="nav customer-resource">


                {/* =========================
                    SHOP
                ========================== */}

                <div className="nav-item">

                    <span className="nav-item-label">
                        Shop
                    </span>

                    <div className="mega-menu">

                        <div className="mega-menu-inner">

                            <div className="mega-menu-intro">

                                <span className="mega-menu-eyebrow">
                                    EXPLORE
                                </span>

                                <h3>
                                    Shop
                                </h3>

                                <p>
                                    Discover our products, treatments
                                    and personalized experiences.
                                </p>

                            </div>


                            <div className="mega-menu-content">

                                {offers.map((offer, index) => {

                                    const [type, items] =
                                        Object.entries(offer)[0];

                                    return (

                                        <div
                                            className="mega-menu-section"
                                            key={index}
                                        >

                                            <h4>
                                                {type.charAt(0).toUpperCase()}
                                                {type.slice(1)}
                                            </h4>

                                            <ul className="mega-menu-list">

                                                {items.map((item) => (

                                                    <li
                                                        className="mega-menu-list-item"
                                                        key={item.id}
                                                    >

                                                        <Link href="#">
                                                            {item.name}
                                                        </Link>

                                                    </li>

                                                ))}

                                            </ul>

                                            <Link
                                                href="#"
                                                className="mega-menu-view-all"
                                            >
                                                View all
                                                <span>→</span>
                                            </Link>

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    RESOURCES
                ========================== */}

                <div className="nav-item">

                    <span className="nav-item-label">
                        Resources
                    </span>

                    <div className="mega-menu">

                        <div className="mega-menu-inner">

                            <div className="mega-menu-intro">

                                <span className="mega-menu-eyebrow">
                                    DISCOVER
                                </span>

                                <h3>
                                    Resources
                                </h3>

                                <p>
                                    Learn more about De Skin Culture,
                                    our services and how we can help you.
                                </p>

                            </div>


                            <div className="mega-menu-content">

                                {resources.map((resource, index) => {

                                    const [type, items] =
                                        Object.entries(resource)[0];

                                    return (

                                        <div
                                            className="mega-menu-section mega-menu-resource-section"
                                            key={index}
                                        >

                                            <h4>
                                                Helpful Links
                                            </h4>

                                            <ul className="mega-menu-list">

                                                {items.map((item, itemIndex) => (

                                                    <li
                                                        className="mega-menu-list-item"
                                                        key={itemIndex}
                                                    >

                                                        <Link href="#">
                                                            {item}
                                                        </Link>

                                                    </li>

                                                ))}

                                            </ul>

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    </div>

                </div>


                {/* =========================
                    GALLERY
                ========================== */}

                <div className="nav-item">

                    <span className="nav-item-label">
                        Gallery
                    </span>

                    <div className="mega-menu">

                        <div className="mega-menu-inner">

                            <div className="mega-menu-intro">

                                <span className="mega-menu-eyebrow">
                                    OUR WORK
                                </span>

                                <h3>
                                    Gallery
                                </h3>

                                <p>
                                    Take a look at our treatments,
                                    spa experience and results.
                                </p>

                            </div>


                            <div className="mega-menu-content">

                                {gallery.map((galleryItem, index) => {

                                    const [type, items] =
                                        Object.entries(galleryItem)[0];

                                    return (

                                        <div
                                            className="mega-menu-section"
                                            key={index}
                                        >

                                            <h4>
                                                Explore Gallery
                                            </h4>

                                            <ul className="mega-menu-list">

                                                {items.map((item, itemIndex) => (

                                                    <li
                                                        className="mega-menu-list-item"
                                                        key={itemIndex}
                                                    >

                                                        <Link href="#">
                                                            {item}
                                                        </Link>

                                                    </li>

                                                ))}

                                            </ul>

                                        </div>

                                    );

                                })}

                            </div>

                        </div>

                    </div>

                </div>

            </nav>


            {/* =========================
                BRAND
            ========================== */}

            <div className="customer-welcome-box">

                <span className="customer-logo">

                    <img
                        src=""
                        alt="De Skin Culture"
                    />

                </span>

                <span className="customer-brand-name">
                    <b>
                        DeSkinCulture
                    </b>
                </span>

            </div>


            {/* =========================
                HEADER ACTIONS
            ========================== */}

            <div className="customer-features">

                <button
                    type="button"
                    aria-label="Shopping cart"
                    onClick={() => {
                        window.location.href = "/store/cart";
                    }}
                >
                    <IoCartOutline
                        size={23}
                    />
                </button>


                <button
                    type="button"
                    aria-label="Search"
                    onClick={() => {
                        window.location.href = "/store/search";
                    }}
                >
                    <IoSearchOutline
                        size={23}
                    />
                </button>


                <button
                    type="button"
                    aria-label="Profile"
                    onClick={() => {
                        window.open("/profile", "_blank");
                    }}
                >
                    <IoPersonOutline
                        size={20}
                    />
                </button>

            </div>

        </header>
    );
}