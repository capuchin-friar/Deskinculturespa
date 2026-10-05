import Link from "next/link";
import "./style/xxl.css";
import "./style/mobile.css";
import "./style/tablet.css";
import "./style/ipad.css";

export default function AboutPage() {
  return (
    <main className="dsc-about-page">
      <section className="dsc-about-hero">
        <div className="dsc-about-hero-content">
          <span className="dsc-about-eyebrow">ABOUT DE SKIN CULTURE</span>
          <h1>Skincare is more than <em>looking good.</em></h1>
          <p>
            We believe skincare should be intentional, personal, and rooted in
            confidence. De Skin Culture brings together professional treatments,
            carefully selected products, and personalized consultations to help
            you feel comfortable in your own skin.
          </p>
          <Link className="dsc-about-hero-link" href="/customer/consultation">
            Explore consultations <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="dsc-about-hero-image">
          <img src="/spa.png" alt="A guest receiving a spa treatment" />
          <span>De Skin Culture · Thoughtful care</span>
        </div>
      </section>

      <section className="dsc-about-philosophy">
        <div className="dsc-about-section-label"><span>01</span> OUR PHILOSOPHY</div>
        <div className="dsc-about-philosophy-content">
          <h2>Care that starts <em>with you.</em></h2>
          <div>
            <p>
              Every person&apos;s skin is different. That&apos;s why our approach
              focuses on understanding your needs before recommending a
              treatment, product, or routine.
            </p>
            <p>
              From relaxing spa treatments to targeted skincare solutions, our
              goal is to create experiences that feel thoughtful, comfortable,
              and genuinely useful.
            </p>
          </div>
        </div>
      </section>

      <section className="dsc-about-values">
        <div className="dsc-about-section-heading">
          <span>WHAT WE STAND FOR</span>
          <h2>Simple principles.<br />Meaningful care.</h2>
        </div>
        <div className="dsc-about-values-grid">
          <article><span>01</span><h3>Personal care</h3><p>Treatments and recommendations designed around individual needs.</p></article>
          <article><span>02</span><h3>Quality</h3><p>We focus on thoughtful products and professional experiences.</p></article>
          <article><span>03</span><h3>Confidence</h3><p>Helping you understand and care for your skin with confidence.</p></article>
        </div>
      </section>

      <section className="dsc-about-cta">
        <div><span>YOUR SKIN. YOUR JOURNEY.</span><h2>Ready to take better care of your skin?</h2></div>
        <Link href="/customer/store">Explore our products <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
