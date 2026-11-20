"use client";

import { productPricing } from "@/src/utils/productPrice";

function money(value) {
  return `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export function OfferPrice({ item, className = "" }) {
  const { sale, original, hasDiscount } = productPricing(item);
  return (
    <span className={`offer-price${hasDiscount ? " has-discount" : ""}${className ? ` ${className}` : ""}`}>
      <ins>{money(sale)}</ins>
      {hasDiscount ? <del>{money(original)}</del> : null}
    </span>
  );
}
