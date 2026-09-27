"use client";

import { useState } from "react";
import "./style/xxl.css";


export default function ContactPage() {

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (
        <main className="dsc-contact-page">

            <section className="dsc-contact-hero">

                <span>
                    GET IN TOUCH
                </span>

                <h1>
                    We'd love to<br />
                    <em>hear from you.</em>
                </h1>

                <p>
                    Have a question about a product, service,
                    appointment, or your skincare journey?
                    We're here to help.
                </p>

            </section>


            <section className="dsc-contact-main">

                <div className="dsc-contact-information">

                    <span className="dsc-contact-label">
                        CONTACT INFORMATION
                    </span>

                    <h2>
                        Let's start
                        a conversation.
                    </h2>

                    <div className="dsc-contact-detail">
                        <span>PHONE</span>
                        <p>+234 810 132 1973</p>
                    </div>

                    <div className="dsc-contact-detail">
                        <span>EMAIL</span>
                        <p>chinelodavids@gmail.com</p>
                    </div>

                    <div className="dsc-contact-detail">
                        <span>STORE</span>
                        <p>
                            No 195 Ifite-Road,
                            Ifite-Awka, Green House
                        </p>
                    </div>

                    <div className="dsc-contact-hours">
                        <span>OPENING HOURS</span>
                        <p>
                            Monday – Saturday<br />
                            9:00 AM – 6:00 PM
                        </p>
                    </div>

                </div>


                <form className="dsc-contact-form">

                    <div className="dsc-contact-field">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Your name"
                        />
                    </div>


                    <div className="dsc-contact-field">
                        <label>Email</label>

                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Your email address"
                        />
                    </div>


                    <div className="dsc-contact-field">
                        <label>Message</label>

                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            placeholder="How can we help?"
                            rows="7"
                        />
                    </div>


                    <button type="submit">
                        Send Message
                    </button>

                </form>

            </section>

        </main>
    );
}