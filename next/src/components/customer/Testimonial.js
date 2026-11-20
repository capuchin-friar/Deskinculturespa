"use client";

import { useState } from "react";
import { IoArrowBack, IoArrowForward } from "react-icons/io5";

const testimonials = [
  {
    id: 1,
    name: "Sarah M.",
    location: "Lagos, Nigeria",
    image: "/home/testimonial-sarah.jpg",
    rating: 5,
    text: "I absolutely loved my experience at De Skin Culture. The treatment was relaxing, professional, and my skin felt amazing afterward.",
  },
  {
    id: 2,
    name: "Amaka O.",
    location: "Abuja, Nigeria",
    image: "/home/testimonial-amaka.jpg",
    rating: 4,
    text: "The staff were incredibly welcoming and attentive. I could immediately tell that they genuinely cared about my skin and overall experience.",
  },
  {
    id: 3,
    name: "Stephen C.",
    location: "Port Harcourt, Nigeria",
    image: "/home/testimonial-stephen.jpg",
    rating: 4,
    text: "So far I love this product. It's lightweight and absorbs almost instantly. It has a really silky smooth consistency and glides right onto your skin.",
  },
  {
    id: 4,
    name: "Jessica A.",
    location: "London, UK",
    image: "/home/testimonial-jessica.jpg",
    rating: 5,
    text: "The entire experience was beautiful from start to finish. The atmosphere was peaceful, the service was excellent, and I left feeling completely refreshed.",
  },
  {
    id: 5,
    name: "Grace E.",
    location: "Accra, Ghana",
    image: "/home/testimonial-grace.jpg",
    rating: 3,
    text: "De Skin Culture has completely changed how I take care of my skin. Their recommendations have been simple, effective, and perfect for my skin.",
  },
];

function QuoteMark() {
  return (
    <svg
      className="review-card__quote"
      viewBox="0 0 32 24"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M0 24V13.1C0 5.9 3.4 1.3 10.2 0l1.4 3.3C7.3 4.7 5.3 7.8 5.6 12.4H12V24H0zm18.4 0V13.1C18.4 5.9 21.8 1.3 28.6 0L30 3.3c-4.3 1.4-6.3 4.5-6 9.1H32V24H18.4z"
      />
    </svg>
  );
}

function Stars({ rating }) {
  return (
    <div className="review-card__stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < rating;
        return (
          <svg
            key={index}
            viewBox="0 0 24 24"
            className={
              filled ? "review-card__star is-filled" : "review-card__star"
            }
            aria-hidden="true"
          >
            <path
              d="M12 2.6l2.7 5.6 6.2.9-4.5 4.3 1.1 6.1L12 16.6 6.5 19.5l1.1-6.1L3.1 9.1l6.2-.9L12 2.6z"
              fill={filled ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
          </svg>
        );
      })}
    </div>
  );
}

export default function Testimonials() {
  const [start, setStart] = useState(0);

  const visible = [0, 1, 2].map(
    (offset) => testimonials[(start + offset) % testimonials.length],
  );

  const prev = () =>
    setStart((current) => (current - 1 + testimonials.length) % testimonials.length);
  const next = () =>
    setStart((current) => (current + 1) % testimonials.length);

  return (
    <div className="reviews-carousel">
      <div className="reviews-carousel__track">
        {visible.map((review) => (
          <article className="review-card" key={`${review.id}-${start}`}>
            <div className="review-card__top">
              <div className="review-card__identity">
                <img src={review.image} alt={review.name} />
                <div>
                  <strong>{review.name}</strong>
                  <span>{review.location}</span>
                </div>
              </div>
              <QuoteMark />
            </div>
            <p className="review-card__text">{review.text}</p>
            <Stars rating={review.rating} />
          </article>
        ))}
      </div>

      <div className="reviews-carousel__nav">
        <button
          type="button"
          className="reviews-carousel__btn reviews-carousel__btn--prev"
          onClick={prev}
          aria-label="Previous reviews"
        >
          <IoArrowBack />
        </button>
        <button
          type="button"
          className="reviews-carousel__btn reviews-carousel__btn--next"
          onClick={next}
          aria-label="Next reviews"
        >
          <IoArrowForward />
        </button>
      </div>
    </div>
  );
}
