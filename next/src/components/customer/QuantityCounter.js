"use client";

import { useState } from "react";

export default function QuantityCounter() {
    const [quantity, setQuantity] = useState(1);

    const increase = () => {
        setQuantity((prev) => prev + 1);
    };

    const decrease = () => {
        setQuantity((prev) => Math.max(1, prev - 1));
    };

    return (
        <div className="quantity-counter">
            <button
                type="button"
                className="quantity-btn"
                onClick={decrease}
                disabled={quantity === 1}
            >
                −
            </button>

            <span className="quantity-number">
                {quantity}
            </span>

            <button
                type="button"
                className="quantity-btn"
                onClick={increase}
            >
                +
            </button>
        </div>
    );
}