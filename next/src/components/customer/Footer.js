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

                        <p>Awka Store</p>

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
                            <Link href="/about">
                                About Us
                            </Link>
                        </li>

                        <li>
                            <Link href="/blogs">
                                Blogs
                            </Link>
                        </li>

                        <li>
                            <Link href="/shipping-returns">
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
                            <a href="tel:+2348101321973">
                                +234 810 132 1973
                            </a>
                        </li>

                        <li>
                            <a href="mailto:chinelodavids@gmail.com">
                                chinelodavids@gmail.com
                            </a>
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
                            <a href="https://www.instagram.com/deskinculture?stkn=b2p3OWkyNTJpdGs5&utm_source=qr" target="_blank" rel="noreferrer">
                                Instagram
                            </a>
                        </li>

                        <li>
                            <a href="https://www.facebook.com/dskinculture?mibextid=wwXIfr&rdid=VV6cQmYbB0wD7XWB&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18Qf6He6kx%2F%3Fmibextid%3DwwXIfr#" target="_blank" rel="noreferrer">
                                Facebook
                            </a>
                        </li>

                        <li>
                            <a href="https://www.tiktok.com/@deskinculturespa12?_r=1&_t=ZS-9AHYvvOnyrZ" target="_blank" rel="noreferrer">
                                TikTok
                            </a>
                        </li>

                    </ul>

                </div>

            </div>


            {/* Copyright */}
            <div className="dsc-footer-copyright">
                © {new Date().getFullYear()} <i>DeSkinCulture</i>.
                All rights reserved.
            </div>

        </footer>
    );
}