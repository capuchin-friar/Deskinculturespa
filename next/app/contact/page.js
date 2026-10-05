"use client";

import { useState } from "react";
import "./style/xxl.css";
import "./style/mobile.css";
import "./style/tablet.css";
import "./style/ipad.css";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <main className="dsc-contact-page">
      <section className="dsc-contact-hero">
        <span>GET IN TOUCH</span>
        <h1>We&apos;d love to <em>hear from you.</em></h1>
        <p>Have a question about a product, service, appointment, or your skincare journey? We&apos;re here to help.</p>
        <div className="dsc-contact-hero-note"><span aria-hidden="true">✳</span> A thoughtful conversation starts here.</div>
      </section>
      <section className="dsc-contact-main">
        <div className="dsc-contact-information">
          <span className="dsc-contact-label">CONTACT INFORMATION</span>
          <h2>Let&apos;s start a conversation.</h2>
          <div className="dsc-contact-detail"><span>PHONE</span><a href="tel:+2348101321973">+234 810 132 1973</a></div>
          <div className="dsc-contact-detail"><span>EMAIL</span><a href="mailto:chinelodavids@gmail.com">chinelodavids@gmail.com</a></div>
          <div className="dsc-contact-detail"><span>VISIT</span><p>No 195 Ifite-Road,<br />Ifite-Awka, Green House</p></div>
        </div>
        <form className="dsc-contact-form">
          <div className="dsc-contact-form-heading"><span>WRITE TO US</span><h2>How can we help?</h2></div>
          <div className="dsc-contact-field">
            <label htmlFor="contact-name">Name</label>
            <input id="contact-name" type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" autoComplete="name" />
          </div>
          <div className="dsc-contact-field">
            <label htmlFor="contact-email">Email</label>
            <input id="contact-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="Your email address" autoComplete="email" />
          </div>
          <div className="dsc-contact-field">
            <label htmlFor="contact-message">Message</label>
            <textarea id="contact-message" name="message" value={form.message} onChange={handleChange} placeholder="Tell us what you need" rows="6" />
          </div>
          <button type="submit">Send message <span aria-hidden="true">↗</span></button>
        </form>
      </section>
    </main>
  );
}
