"use client";

import { useState } from "react";
import "./style/xxl.css";
import "./style/mobile.css";
import "./style/tablet.css";
import "./style/ipad.css";

export default function NewsletterPage() {
  const [email, setEmail] = useState("");

  return (
    <main className="dsc-newsletter-page">
      <section className="dsc-newsletter-hero">
        <div className="dsc-newsletter-content">
          <span>THE DSC JOURNAL</span>
          <h1>Stay inspired.<br /><em>Stay informed.</em></h1>
          <p>Receive skincare education, wellness notes, and updates from De Skin Culture.</p>
          <form className="dsc-newsletter-form">
            <label htmlFor="newsletter-email">Email address</label>
            <div className="dsc-newsletter-input-group">
              <input id="newsletter-email" name="email" type="email" placeholder="Enter your email address" value={email} onChange={(event) => setEmail(event.target.value)} />
              <button type="submit">Subscribe <span aria-hidden="true">→</span></button>
            </div>
          </form>
          <small>By subscribing, you agree to our Privacy Policy.</small>
        </div>
        <div className="dsc-newsletter-visual" role="img" aria-label="A calm spa treatment setting"><span className="dsc-newsletter-circle">DSC</span></div>
      </section>
      <section className="dsc-newsletter-note">
        <span>DE SKIN CULTURE</span>
        <p>Thoughtful care, made personal.</p>
      </section>
    </main>
  );
}
