"use client";

import { useState } from "react";
import "./style/xxl.css";


export default function NewsletterPage() {

    const [email, setEmail] = useState("");

    return (
        <main className="dsc-newsletter-page">

            <section className="dsc-newsletter-hero">

                <div className="dsc-newsletter-content">

                    <span>
                        THE DSC JOURNAL
                    </span>

                    <h1>
                        Stay inspired.
                        <br />
                        <em>Stay informed.</em>
                    </h1>

                    <p>
                        Join our community and receive skincare
                        education, product drops, exclusive offers,
                        wellness tips, and updates from De Skin Culture.
                    </p>

                    <form className="dsc-newsletter-form">

                        <input
                            type="email"
                            placeholder="Enter your email address"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                        <button type="submit">
                            Subscribe
                        </button>

                    </form>

                    <small>
                        No spam. Just thoughtful skincare,
                        wellness and occasional special offers.
                    </small>

                </div>


                <div className="dsc-newsletter-visual">

                    <div className="dsc-newsletter-circle">
                        DSC
                    </div>

                </div>

            </section>


            <section className="dsc-newsletter-benefits">

                <div>
                    <span>01</span>
                    <h3>Skincare Tips</h3>
                    <p>
                        Practical information to help you
                        understand and care for your skin.
                    </p>
                </div>

                <div>
                    <span>02</span>
                    <h3>New Arrivals</h3>
                    <p>
                        Be the first to discover selected
                        products and treatments.
                    </p>
                </div>

                <div>
                    <span>03</span>
                    <h3>Exclusive Offers</h3>
                    <p>
                        Receive occasional offers and
                        subscriber-only updates.
                    </p>
                </div>

            </section>

        </main>
    );
}