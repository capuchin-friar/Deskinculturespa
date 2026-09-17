import Link from "next/link";
import "./style/xxl.css";

export default function AboutPage() {
    return (
        <main className="dsc-about-page">

            {/* Hero */}
            <section className="dsc-about-hero">

                <div className="dsc-about-hero-content">

                    <span className="dsc-about-eyebrow">
                        ABOUT DE SKIN CULTURE
                    </span>

                    <h1>
                        Skincare is more than
                        <span> looking good.</span>
                    </h1>

                    <p>
                        We believe skincare should be intentional,
                        personal, and rooted in confidence. De Skin
                        Culture brings together professional treatments,
                        carefully selected products, and personalized
                        consultations to help you feel comfortable
                        in your own skin.
                    </p>

                </div>

                <div className="dsc-about-hero-image">
                    <div className="dsc-about-image-placeholder">
                        DE SKIN
                        <br />
                        CULTURE
                    </div>
                </div>

            </section>


            {/* Philosophy */}
            <section className="dsc-about-philosophy">

                <div className="dsc-about-section-label">
                    <span>01</span>
                    OUR PHILOSOPHY
                </div>

                <div className="dsc-about-philosophy-content">

                    <h2>
                        Care that starts
                        <em> with you.</em>
                    </h2>

                    <p>
                        Every person's skin is different. That's why
                        our approach focuses on understanding your
                        needs before recommending a treatment,
                        product, or routine.
                    </p>

                    <p>
                        From relaxing spa treatments to targeted
                        skincare solutions, our goal is to create
                        experiences that feel thoughtful, comfortable,
                        and genuinely useful.
                    </p>

                </div>

            </section>


            {/* Values */}
            <section className="dsc-about-values">

                <div className="dsc-about-section-heading">

                    <span>WHAT WE STAND FOR</span>

                    <h2>
                        Simple principles.
                        <br />
                        Meaningful care.
                    </h2>

                </div>

                <div className="dsc-about-values-grid">

                    <article>
                        <span>01</span>
                        <h3>Personal Care</h3>
                        <p>
                            Treatments and recommendations designed
                            around individual needs.
                        </p>
                    </article>

                    <article>
                        <span>02</span>
                        <h3>Quality</h3>
                        <p>
                            We focus on thoughtful products and
                            professional experiences.
                        </p>
                    </article>

                    <article>
                        <span>03</span>
                        <h3>Confidence</h3>
                        <p>
                            Helping you understand and care for
                            your skin with confidence.
                        </p>
                    </article>

                </div>

            </section>


            {/* CTA */}
            <section className="dsc-about-cta">

                <span>
                    YOUR SKIN. YOUR JOURNEY.
                </span>

                <h2>
                    Ready to take better
                    care of your skin?
                </h2>

                <Link href="/store">
                    Explore Our Products
                </Link>

            </section>

        </main>
    );
}