import Link from "next/link";

export function Footer() {
    return (
        <footer className="dsc-footer">

            {/* Newsletter */}
            <div className="dsc-footer-newsletter">

                <div className="dsc-footer-newsletter-left">
                    <span className="dsc-footer-eyebrow">
                        STAY CONNECTED
                    </span>

                    <h1>
                        Subscribe to Our Newsletter
                    </h1>

                    <p>
                        All the latest product drops, limited offers,
                        in-store event info–straight to your inbox.
                    </p>
                </div>

                <div className="dsc-footer-newsletter-right">

                    <div className="dsc-footer-newsletter-form">

                        <label htmlFor="dsc-newsletter-email">
                            Email address
                        </label>

                        <div className="dsc-footer-newsletter-input-group">

                            <input
                                type="email"
                                name="email"
                                id="dsc-newsletter-email"
                                placeholder="Enter your email address"
                            />

                            <button type="button">
                                Subscribe
                            </button>

                        </div>

                        <p>
                            By subscribing, you agree to our Privacy Policy.
                        </p>

                    </div>

                </div>

            </div>


            {/* Footer Navigation */}
            <div className="dsc-footer-navigation">

                {/* Brand / Address */}
                <div className="dsc-footer-column dsc-footer-brand">

                    <h1>
                        Deskinculture
                    </h1>

                    <div className="dsc-footer-address">

                        <Link href="#">
                            Awka Store
                        </Link>

                        <p>
                            {`No 195 Ifite-Road,
Ifite-Awka, Green House`}
                        </p>

                    </div>

                </div>


                {/* Resources */}
                <div className="dsc-footer-column">

                    <h1>
                        Resource
                    </h1>

                    <ul>

                        <li>
                            <Link href="#">
                                About Us
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                Blogs
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                FAQ's
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                Shipping & Returns
                            </Link>
                        </li>

                    </ul>

                </div>


                {/* Contact */}
                <div className="dsc-footer-column">

                    <h1>
                        Contact Us
                    </h1>

                    <ul>

                        <li>
                            <Link href="#">
                                +234 000-000-0000
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                +234 810 132 1973
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                chinelodavids@gmail.com
                            </Link>
                        </li>

                    </ul>

                </div>


                {/* Social */}
                <div className="dsc-footer-column">

                    <h1>
                        Follow Us
                    </h1>

                    <ul>

                        <li>
                            <Link href="#">
                                Instagram
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                Facebook
                            </Link>
                        </li>

                        <li>
                            <Link href="#">
                                TikTok
                            </Link>
                        </li>

                    </ul>

                </div>

            </div>


            {/* Copyright */}
            <div className="dsc-footer-copyright">
                © {new Date().getFullYear()} De Skin Culture.
                All rights reserved.
            </div>

        </footer>
    );
}