"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { IoBagHandleOutline, IoArrowForward } from "react-icons/io5";
import Card from "./CartCard";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

export const Cart = () => {
  const cart = useSelector((state) => state.cart?.cart || []);
  const itemCount = cart.reduce((count, item) => count + (Number(item.quantity) || 0), 0);
  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
    0,
  );

  if (cart.length === 0) {
    return (
      <section className="dsc-cart-page dsc-cart-page--empty" aria-labelledby="dsc-cart-empty-title">
        <div className="dsc-cart-empty">
          <span className="dsc-cart-empty__icon" aria-hidden="true"><IoBagHandleOutline /></span>
          <span className="dsc-cart-empty__eyebrow">YOUR BAG</span>
          <h1 id="dsc-cart-empty-title">Your bag is empty</h1>
          <p>Take a moment for yourself. Discover products for your next self-care ritual.</p>
          <Link className="dsc-cart-empty__button" href="/store">
            Explore the store <IoArrowForward aria-hidden="true" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="dsc-cart-page" aria-labelledby="dsc-cart-title">
      <header className="dsc-cart-heading">
        <div>
          <span className="dsc-cart-heading__eyebrow">YOUR BAG</span>
          <h1 id="dsc-cart-title">Shopping bag</h1>
          <p>{cart.length} {cart.length === 1 ? "product" : "products"} · {itemCount} {itemCount === 1 ? "item" : "items"}</p>
        </div>
        <Link className="dsc-cart-continue" href="/store">Continue shopping <IoArrowForward aria-hidden="true" /></Link>
      </header>

      <div className="dsc-cart-layout">
        <section className="dsc-cart-items" aria-label="Items in your bag">
          {cart.map((item) => <Card item={item} key={item.id} />)}
        </section>

        <aside className="dsc-cart-summary" aria-labelledby="dsc-cart-summary-title">
          <h2 id="dsc-cart-summary-title">Order summary</h2>
          <div className="dsc-cart-summary__row">
            <span>Subtotal</span>
            <span>₦{formatPrice(subtotal)}</span>
          </div>
          <div className="dsc-cart-summary__row">
            <span>Delivery</span>
            <span>Free</span>
          </div>
          <div className="dsc-cart-summary__total">
            <span>Total</span>
            <strong>₦{formatPrice(subtotal)}</strong>
          </div>
          <Link className="dsc-cart-summary__checkout" href="/customer/store/checkout">
            Proceed to checkout <IoArrowForward aria-hidden="true" />
          </Link>
          <p className="dsc-cart-summary__note">Your order details will be confirmed at checkout.</p>
        </aside>
      </div>

      <Link className="dsc-cart-continue dsc-cart-continue--bottom" href="/store">Continue shopping <IoArrowForward aria-hidden="true" /></Link>
    </section>
  );
};
