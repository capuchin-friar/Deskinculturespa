"use client";

import { useEffect, useState } from "react";

const testimonials = [
    {
        id: 1,
        name: "Sarah M.",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop",
        text: "I absolutely loved my experience at De Skin Culture. The treatment was relaxing, professional, and my skin felt amazing afterward."
    },
    {
        id: 2,
        name: "Amaka O.",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&auto=format&fit=crop",
        text: "The staff were incredibly welcoming and attentive. I could immediately tell that they genuinely cared about my skin and overall experience."
    },
    {
        id: 3,
        name: "Stephen C.",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop",
        text: "So far I love this product. It's lightweight and absorbs almost instantly. It has a really silky smooth consistency and glides right onto your skin. I've seen a slight improvement of my skin and look forward to seeing more."
    },
    {
        id: 4,
        name: "Jessica A.",
        image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=500&auto=format&fit=crop",
        text: "The entire experience was beautiful from start to finish. The atmosphere was peaceful, the service was excellent, and I left feeling completely refreshed."
    },
    {
        id: 5,
        name: "Grace E.",
        image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=500&auto=format&fit=crop",
        text: "De Skin Culture has completely changed how I take care of my skin. Their recommendations have been simple, effective, and perfect for my skin."
    }
];

export default function Testimonials() {
    const [active, setActive] = useState(2);

    useEffect(() => {
        const timer = setInterval(() => {
            setActive((current) => (current + 1) % testimonials.length);
        }, 5000);

        return () => clearInterval(timer);
    }, []);

    return (
        // <section className="testimonials">

        //     <div className="testimonials-heading">
        //         <h2>TESTIMONIALS</h2>
        //     </div>

        <div className="testimonial-carousel">

            <div className="testimonial-avatars">
                {testimonials.map((testimonial, index) => {

                    const distance =
                        (index - active + testimonials.length) %
                        testimonials.length;

                    let position = distance;

                    if (distance > testimonials.length / 2) {
                        position = distance - testimonials.length;
                    }

                    return (
                        <button
                            key={testimonial.id}
                            className={`testimonial-avatar position-${position}`}
                            onClick={() => setActive(index)}
                        >
                            <img
                                src={testimonial.image}
                                alt={testimonial.name}
                            />
                        </button>
                    );
                })}
            </div>

            <div className="testimonial-content">

                <p>
                    {testimonials[active].text}
                </p>

                <span>
                    — {testimonials[active].name}
                </span>

            </div>

        </div>

        // </section>
    );
}