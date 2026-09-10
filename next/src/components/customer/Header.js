
import { IoCart, IoCartOutline, IoHeart, IoHeartOutline, IoPersonOutline, IoSearchOutline, IoStorefrontOutline } from "react-icons/io5";
import Link from "next/link";
export function Header() {

    let offers = [
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

    let resources = [
        {
            "resource": [
                "About",
                // "Career",
                "Blogs",
                "FAQ",
                "Contact us",
                "News Letter",
                "Referral"
            ]
        }
    ]

    return (
        <>
            <header className="customer-header">
                <nav className="nav customer-resource">
                    <div className="nav-item">
                        Shop
                        <div className="mega-menu">
                            <div className="mega-menu-content">
                                {
                                    offers.map((o, i) => {
                                        const [type, items] = Object.entries(o)[0];

                                        return (
                                            <div className="mega-menu-offers" key={i}>
                                                <h4>{type.charAt(0).toUpperCase()}{type.slice(1)}</h4>

                                                <ul className="mega-menu-opt-cnt">
                                                    {items.map((item, index) => (
                                                        <li className="mega-menu-opt" key={index}>
                                                            <Link href="#">
                                                                {item.name}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    <div className="nav-item">
                        Resources
                        <div className="mega-menu">
                            <div className="mega-menu-content">
                                {
                                    resources.map((o, i) => {
                                        const [type, items] = Object.entries(o)[0];

                                        return (
                                            <div className="mega-menu-offers" key={i}>
                                                {/* <h4>{type}</h4> */}

                                                <ul className="mega-menu-opt-cnt">
                                                    {items.map((item, index) => (
                                                        <li className="mega-menu-opt" key={index}>
                                                            <Link href="#">
                                                                {item}
                                                            </Link>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    </div>

                    <div className="nav-item">
                        Gallery
                        <div className="mega-menu">
                            <div className="mega-menu-content">
                                <h3>Services</h3>
                                <p>Explore our services</p>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="customer-welcome-box">
                    <span>
                        <img src="" alt="logo" />
                    </span>
                    &nbsp;
                    <span><b>DeSkinCulture</b></span>
                </div>

                <div className="customer-features">
                    <button onClick={e => {
                        window.location.href = ("/cart");
                    }}>
                        <IoCartOutline height={23} width={23} />
                    </button>
                    <button onClick={e => {
                        window.location.href = ("/wishlist");
                    }}>
                        <IoHeartOutline height={23} width={23} />
                    </button>
                    <button onClick={e => {
                        window.location.href = ("/search");
                    }}>
                        <IoSearchOutline height={23} width={23} />
                    </button>
                    <button onClick={e => {
                        window.open("/profile", "_blank");
                    }}>
                        <IoPersonOutline height={20} width={20} />
                    </button>
                </div>

            </header>
        </>
    )
}