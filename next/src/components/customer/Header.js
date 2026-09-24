import {
    IoCartOutline,
    IoPersonOutline,
    IoSearchOutline
} from "react-icons/io5";

import Link from "next/link";
import useProductHandler from "@/src/hooks/product";
import useServiceHandler from "@/src/hooks/service";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";


export function Header() {
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [appointments, setAppointments] = useState([]);

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
                    href: "/about"
                },
                {
                    name: "Blogs",
                    href: "/blogs"
                },
                // {
                //     name: "FAQ",
                //     href: "/faq"
                // },
                {
                    name: "Contact Us",
                    href: "/contact"
                },
                {
                    name: "Newsletter",
                    href: "/newsletter"
                },
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

                                                        <Link href={type === "products" ? `/store/${item.id}` : type === "services" ? `/services/${item.id}` : type === "appointments" ? `consultation/${item.id}` : "#"}>
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
                                                href={type === "products" ? `/store` : type === "services" ? `/services` : type === "appointments" ? `consultation` : "#"}
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
                        <Link href={"gallery"} style={{
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
                        window.location.href = "/store/search";
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

        </header>
    );
}