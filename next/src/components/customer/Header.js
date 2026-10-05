import {
    IoChevronBack,
    IoChevronForward,
    IoClose,
    IoCartOutline,
    IoFilterOutline,
    IoMenu,
    IoPersonOutline
} from "react-icons/io5";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useProductHandler from "@/src/hooks/product";
import useServiceHandler from "@/src/hooks/service";
import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

function serviceCategoryHref(service) {
    const category = String(service?.category ?? "").trim().toLowerCase().replace(/\s+/g, "-");
    return category ? `/services/${category}` : "/services";
}

export function Header({
    storeFilterEnabled = false,
    storeFilterOpen = false,
    onToggleStoreFilter,
    onCloseStoreFilter,
}) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileMenuStack, setMobileMenuStack] = useState([]);
    const mobileMenuCloseRef = useRef(null);
    const router = useRouter();

    let {
        cart
    } = useSelector(s => s.cart);

    const {
        products: prods
    } = useProductHandler();

    const {
        services: servs
    } = useServiceHandler();

    const products = prods.slice(0, 4);
    const services = servs.slice(0, 4);

    const offers = [
        {
            products: products
        },
        {
            services: services
        }
    ];


    const resources = [
        {
            resource: [
                {
                    name: "About Us",
                    href: "/about"
                },
                // {
                //     name: "Blogs",
                //     href: "/blogs"
                // },
                // {
                //     name: "FAQ",
                //     href: "/faq"
                // },
                {
                    name: "Contact Us",
                    href: "/contact"
                },
                // {
                //     name: "Newsletter",
                //     href: "/newsletter"
                // },
                // {
                //     name: "Referral Program",
                //     href: "/referral"
                // },
                {
                    name: "Shipping & Returns",
                    href: "/shipping-returns"
                }
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
                            href: `/store/${item.id}`,
                        })),
                        { name: "View all", href: "/store" },
                    ],
                },
                {
                    name: "Services",
                    children: [
                        ...services.map((item) => ({
                            name: item.subcategory ?? "service",
                            href: serviceCategoryHref(item),
                        })),
                        { name: "View all", href: "/services" },
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
        { name: "Gallery", href: "/gallery" },
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

            <div className="customer-header-mobile-controls">
                <button
                    type="button"
                    className="customer-mobile-menu-trigger"
                    aria-label="Open navigation menu"
                    aria-expanded={mobileMenuOpen}
                    disabled={storeFilterOpen}
                    onClick={() => {
                        onCloseStoreFilter?.();
                        setMobileMenuStack([]);
                        setMobileMenuOpen(true);
                    }}
                >
                    <IoMenu size={25} aria-hidden="true" />
                </button>
                {storeFilterEnabled && (
                    <button
                        type="button"
                        className="customer-store-filter-toggle"
                        aria-label={storeFilterOpen ? "Close store filters" : "Open store filters"}
                        aria-controls="customer-store-filter"
                        aria-expanded={storeFilterOpen}
                        onClick={onToggleStoreFilter}
                    >
                        <IoFilterOutline size={19} aria-hidden="true" />
                        {/* <span>Filter</span> */}
                    </button>
                )}
            </div>

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

                                                        <Link href={type === "products" ? `/store/${item.id}` : type === "services" ? serviceCategoryHref(item) : type === "appointments" ? `/consultation/${item.id}` : "/"}>
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
                                                href={type === "products" ? "/store" : type === "services" ? "/services" : type === "appointments" ? "/consultation" : "/"}
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

                                    const items = Object.values(resource)[0];

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
                        <Link href="/gallery" style={{
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

                                                        <Link href="/gallery">
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
            }} className="customer-welcome-box" onClick={() => {
                router.push("/");
            }}>

                <span className="customer-logo">

                    <img
                        src="deskinculture_logo.png"
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
                        router.push("/store/cart");
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
                        router.push("/store");
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
                        router.push("/login");
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
