import Link from "next/link";


export function Footer() {


    return (
        <>
            <footer>
                <div className="footer-newsletter-cnt">
                    <div className="left">
                        <h1>
                            Subscribe to Our Newsletter
                        </h1>
                        <p>
                            All the latest product drops, limited offers, in-store event info–straight to your inbox.
                        </p>
                    </div>
                    <div className="right">
                        <div className="footer-input-cnt">
                            <label htmlFor="">Stay up to date Email</label>
                            <div className="input-btn">
                                <input type="email" name="" id="" />
                                <button>Subscribe</button>
                            </div>
                            <p>By signing, you agreed to our privacy and policy</p>
                        </div>
                    </div>

                </div>
                <div className="footer-col-cnt">
                    <div className="footer-cols">
                        <h1>
                            Deskinculture
                        </h1>
                        <div className="footer-address">
                            <Link href={"#"}>Awka Store</Link>
                            <p style={{ whiteSpace: "pre-line" }}>
                                {`No 195 Ifite-Road,
                    Ifite-Awka, Green House`}
                            </p>
                        </div>
                    </div>
                    <div className="footer-cols">
                        <h1>Resource</h1>
                        <ul>
                            <li>
                                <Link href={"#"}>
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    Blogs
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    FAQ's
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    Shipping & Returns
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-cols">
                        <h1>Contact Us</h1>
                        <ul>
                            <li>
                                <Link href={"#"}>
                                    +234 000-000-0000
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    +2348101321973
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    chinelodavids@gmail.com
                                </Link>
                            </li>
                        </ul>
                    </div>
                    <div className="footer-cols">
                        <h1>Follow Us</h1>
                        <ul>
                            <li>
                                <Link href={"#"}>
                                    Instagram
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    Facebook
                                </Link>
                            </li>
                            <li>
                                <Link href={"#"}>
                                    Tiktok
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="footer-copywright">
                    © {new Date().getFullYear()} De Skin Culture. All rights reserved.
                </div>
            </footer>
        </>
    )
}