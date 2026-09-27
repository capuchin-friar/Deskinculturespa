import {
    IoChevronBack,
    IoChevronForward,
    IoClose,
    IoCartOutline,
    IoMenu,
    IoPersonOutline
} from "react-icons/io5";

import Link from "next/link";
import useProductHandler from "@/src/hooks/product";
import useServiceHandler from "@/src/hooks/service";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";


export function Header() {
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileMenuStack, setMobileMenuStack] = useState([]);
    const mobileMenuCloseRef = useRef(null);

    let {
        cart
    } = useSelector(s => s.cart);

    const {
        products: prods
    } = useProductHandler();

    const {
        services: servs
    } = useServiceHandler();

    useEffect(() => {
        setProducts(prods.splice(0, 4))
    }, [prods]);
    useEffect(() => {
        setServices(servs.splice(0, 4))
    }, [servs]);

    const offers = [
        {
            products: products
        },
        {
            services: services
        },
        {
            appointments: appointments
        }
    ];


    const resources = [
        {
            resource: [
                {
                    name: "About Us",
                    href: "/customer/about"
                },
                {
                    name: "Blogs",
                    href: "/customer/blogs"
                },
                // {
                //     name: "FAQ",
                //     href: "/faq"
                // },
                {
                    name: "Contact Us",
                    href: "/customer/contact"
                },
                {
                    name: "Newsletter",
                    href: "/customer/newsletter"
                },
                // {
                //     name: "Referral Program",
                //     href: "/referral"
                // },
                {
                    name: "Shipping & Returns",
                    href: "/customer/shipping-returns"
                }
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

    const mobileNavigation = [
        { name: "Home", href: "/" },
        {
            name: "Shop",
            children: [
                {
                    name: "Products",
                    children: [
                        ...products.map((item) => ({
                            name: item.name,
                            href: `/customer/store/${item.id}`,
                        })),
                        { name: "View all", href: "/customer/store" },
                    ],
                },
                {
                    name: "Services",
                    children: [
                        ...services.map((item) => ({
                            name: item.subcategory ?? "service",
                            href: `/customer/services/${item.id}`,
                        })),
                        { name: "View all", href: "/customer/services" },
                    ],
                },
                {
                    name: "Appointments",
                    children: [
                        ...appointments.map((item) => ({
                            name: item.name ?? item.title ?? "Appointment",
                            href: `/customer/consultation/${item.id}`,
                        })),
                        { name: "View all", href: "/customer/consultation" },
                    ],
                },
            ],
        },
        {
            name: "Resources",
            children: resources[0].resource.map((item) => ({
                name: item.name,
                href: item.href,
            })),
        },
        { name: "Gallery", href: "/customer/gallery" },
    ];

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
        setMobileMenuStack([]);
    };

    const handleMobileMenuKeyDown = (event) => {
        if (event.key !== "Tab") return;

        const focusable = Array.from(
            event.currentTarget.querySelectorAll('a[href], button:not([disabled])')
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    };

    useEffect(() => {
        if (!mobileMenuOpen) return undefined;

        const bodyStyle = {
            position: document.body.style.position,
            top: document.body.style.top,
            left: document.body.style.left,
            right: document.body.style.right,
            width: document.body.style.width,
            overflow: document.body.style.overflow,
        };
        const htmlOverflow = document.documentElement.style.overflow;
        const scrollY = window.scrollY;
        const closeFromEffect = () => {
            setMobileMenuOpen(false);
            setMobileMenuStack([]);
        };
        const handleKeyDown = (event) => {
            if (event.key === "Escape") closeFromEffect();
        };
        const handleResize = () => {
            if (window.innerWidth > 480) closeFromEffect();
        };

        document.body.style.overflow = "hidden";
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";
        document.documentElement.style.overflow = "hidden";
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("resize", handleResize);
        mobileMenuCloseRef.current?.focus();

        return () => {
            Object.assign(document.body.style, bodyStyle);
            document.documentElement.style.overflow = htmlOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("resize", handleResize);
            window.scrollTo(0, scrollY);
        };
    }, [mobileMenuOpen]);


    return (
        <header className="customer-header">

            <button
                type="button"
                className="customer-mobile-menu-trigger"
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                onClick={() => {
                    setMobileMenuStack([]);
                    setMobileMenuOpen(true);
                }}
            >
                <IoMenu size={25} aria-hidden="true" />
            </button>

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

                                                        <Link href={type === "products" ? `/customer/store/${item.id}` : type === "services" ? `/customer/services/${item.id}` : type === "appointments" ? `/customer/consultation/${item.id}` : "#"}>
                                                            {
                                                                type === "products" ? 
                                                                item.name 
                                                                : type === "services" ? 
                                                                item.subcategory ?? "service"
                                                                : type === "appointments" ? 
                                                                "" : "#"
                                                            }
                                                        </Link>

                                                    </li>

                                                ))}

                                            </ul>

                                            <Link
                                                href={type === "products" ? `/customer/store` : type === "services" ? `/customer/services` : type === "appointments" ? `/customer/consultation` : "#"}
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

                                                        <Link href={`${item.href}`}>
                                                            {item.name}
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

                    <span className="nav-item-label" >
                        <Link href={"/customer/gallery"} style={{
                            textDecoration: "none"
                        }}>
                            Gallery
                        </Link>
                    </span>

                    {/* <div className="mega-menu">

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

                    </div> */}

                </div>

            </nav>


            {/* =========================
                BRAND
            ========================== */}

            <div style={{
                cursor: "pointer"
            }} className="customer-welcome-box" onClick={e => {
                window.location.href = "/"
            }}>

                <span className="customer-logo">

                    <img
                        src="logo.jpeg"
                        alt="De Skin Culture"
                        style={{
                            height: "35px",
                            width: "35px"
                        }}
                    />

                </span>

                &nbsp;
                &nbsp;

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
                        window.location.href = "/customer/store/cart";
                    }}
                    style={{
                        position: "relative"
                    }}
                >
                    <IoCartOutline
                        size={23}
                    />

                    <small style={{
                        color: "#fff",
                        fontSize: "x-small",
                        position: "absolute",
                        top: "1px",
                        right: "1px",
                        background: "#278a3d",
                        borderRadius: "50%",
                        padding: "0px 4px"
                    }}>{(cart.length ?? 0)}</small>
                </button>


                {/* <button
                    type="button"
                    aria-label="Search"
                    onClick={() => {
                        window.location.href = "/customer/store/search";
                    }}
                >
                    <IoSearchOutline
                        size={23}
                    />
                </button> */}


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

            {mobileMenuOpen && (
                <div className="customer-mobile-menu-overlay">
                    <button
                        type="button"
                        className="customer-mobile-menu-backdrop"
                        aria-label="Close navigation menu"
                        onClick={closeMobileMenu}
                    />
                    <section
                        className="customer-mobile-menu-panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Customer navigation"
                        onKeyDown={handleMobileMenuKeyDown}
                    >
                        <div className="customer-mobile-menu-header">
                            {mobileMenuStack.length > 0 ? (
                                <button
                                    type="button"
                                    className="customer-mobile-menu-back"
                                    aria-label="Go back to previous menu"
                                    onClick={() => setMobileMenuStack((stack) => stack.slice(0, -1))}
                                >
                                    <IoChevronBack size={22} aria-hidden="true" />
                                    <span>Back</span>
                                </button>
                            ) : (
                                <span className="customer-mobile-menu-kicker">DE SKIN CULTURE</span>
                            )}

                            <h2>
                                {mobileMenuStack.length > 0
                                    ? mobileMenuStack[mobileMenuStack.length - 1].name
                                    : "Main Menu"}
                            </h2>

                            <button
                                ref={mobileMenuCloseRef}
                                type="button"
                                className="customer-mobile-menu-close"
                                aria-label="Close navigation menu"
                                onClick={closeMobileMenu}
                            >
                                <IoClose size={25} aria-hidden="true" />
                            </button>
                        </div>

                        <nav className="customer-mobile-menu-nav" aria-label="Customer navigation">
                            <ul
                                className="customer-mobile-menu-list"
                                key={mobileMenuStack.map((item) => item.name).join("/") || "main"}
                            >
                                {(mobileMenuStack.length > 0
                                    ? mobileMenuStack[mobileMenuStack.length - 1].children
                                    : mobileNavigation
                                ).map((item) => (
                                    <li key={`${item.name}-${item.href ?? "submenu"}`}>
                                        {item.children ? (
                                            <button
                                                type="button"
                                                className="customer-mobile-menu-item customer-mobile-menu-parent"
                                                aria-haspopup="true"
                                                onClick={() => setMobileMenuStack((stack) => [...stack, item])}
                                            >
                                                <span>{item.name}</span>
                                                <IoChevronForward size={19} aria-hidden="true" />
                                            </button>
                                        ) : (
                                            <Link
                                                className="customer-mobile-menu-item"
                                                href={item.href}
                                                onClick={closeMobileMenu}
                                            >
                                                <span>{item.name}</span>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="customer-mobile-menu-footer">
                            <span>Thoughtful care, made personal.</span>
                        </div>
                    </section>
                </div>
            )}

        </header>
    );
}
