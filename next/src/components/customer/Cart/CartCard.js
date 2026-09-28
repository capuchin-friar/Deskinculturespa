"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { IoTrashOutline, IoImageOutline } from "react-icons/io5";
import { baseApi } from "@/app/api/shared/config";
import { set_cart } from "@/redux/customer/cart";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(price) || 0);

const CartCard = ({ item }) => {
  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart?.cart || []);
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const quantity = Number(item.quantity) || 1;
  const stock = item.stock == null ? null : Number(item.stock);
  const maxQuantity = stock !== null && Number.isFinite(stock) && stock > 0
    ? Math.min(stock, 99)
    : 99;
  const itemTotal = Number(item.price || 0) * quantity;
  const imageUrl = typeof item.thumbnail_url === "string" ? item.thumbnail_url.trim() : "";

  const updateQuantity = async (nextQuantity) => {
    const next = Math.max(1, Math.min(maxQuantity, nextQuantity));
    if (next === quantity) return;

    setBusy(true);
    setErrorMessage("");
    try {
      const { data } = await baseApi.patch("/customers/cart/edit", {
        id: String(item.id),
        qty: next,
      });
      if (!data?.success) {
        throw new Error(data?.message || data?.data || "Could not update this quantity.");
      }
      dispatch(set_cart(cart.map((cartItem) =>
        String(cartItem.id) === String(item.id)
          ? { ...cartItem, quantity: next }
          : cartItem,
      )));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.response?.data?.data || error?.message || "Could not update this quantity. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const removeItem = async () => {
    setBusy(true);
    setErrorMessage("");
    try {
      const { data } = await baseApi.delete("/customers/cart/delete", {
        data: { id: String(item.id) },
      });
      if (!data?.success) {
        throw new Error(data?.message || data?.data || "Could not remove this product.");
      }
      dispatch(set_cart(cart.filter((cartItem) => String(cartItem.id) !== String(item.id))));
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || error?.response?.data?.data || error?.message || "Could not remove this product. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className={`dsc-cart-item${busy ? " is-busy" : ""}`}>
      <Link className="dsc-cart-item__image" href={`/customer/store/${item.product_id}`} aria-label={`View ${item.name}`}>
        {imageUrl && !imageFailed ? (
          <Image
            src={imageUrl}
            alt={item.name || "Product"}
            width={320}
            height={320}
            unoptimized
            onError={() => setImageFailed(true)}
          />
        ) : (
          <span className="dsc-cart-item__placeholder" aria-hidden="true"><IoImageOutline /></span>
        )}
      </Link>

      <div className="dsc-cart-item__content">
        <div className="dsc-cart-item__topline">
          <div className="dsc-cart-item__identity">
            <Link className="dsc-cart-item__name" href={`/customer/store/${item.product_id}`}>
              {item.name || "Product"}
            </Link>
            {stock !== null && Number.isFinite(stock) && (
              <span className={`dsc-cart-item__stock${stock <= 0 ? " is-unavailable" : ""}`}>
                {stock <= 0 ? "Currently unavailable" : `${stock} ${stock === 1 ? "unit" : "units"} available`}
              </span>
            )}
          </div>
          <span className="dsc-cart-item__unit-price">₦{formatPrice(item.price)}</span>
        </div>

        <div className="dsc-cart-item__controls">
          <div className="dsc-cart-quantity" aria-label={`Quantity for ${item.name}`}>
            <button type="button" onClick={() => updateQuantity(quantity - 1)} disabled={busy || quantity <= 1} aria-label={`Decrease quantity of ${item.name}`}>−</button>
            <output aria-live="polite">{quantity}</output>
            <button
              type="button"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={busy || quantity >= maxQuantity || stock === 0}
              aria-label={`Increase quantity of ${item.name}`}
            >+</button>
          </div>

          <button className="dsc-cart-item__remove" type="button" onClick={removeItem} disabled={busy}>
            <IoTrashOutline aria-hidden="true" />
            <span>{busy ? "Updating…" : "Remove"}</span>
          </button>

          <div className="dsc-cart-item__subtotal">
            <span>Item total</span>
            <strong>₦{formatPrice(itemTotal)}</strong>
          </div>
        </div>
      </div>

      {errorMessage && <p className="dsc-cart-item__error" role="status">{errorMessage}</p>}
    </article>
  );
};

export default CartCard;
