"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { baseApi } from "../../../app/api/config";
import { set_cart } from "../../../redux/customer/cart";

export default function CartSummary() {
  const { cart } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  async function removeFromCart(cartId) {
    setLoading(true);
    try {
      const { data } = await baseApi.delete("/cart/delete", { data: { id: cartId } });
      if (!data.success) throw new Error(data.message || data.data || "Unable to remove item");
      dispatch(set_cart(cart.filter((item) => item.id !== cartId)));
    } catch (error) {
      alert(error.message || "Unable to remove item");
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(type, quantity, id) {
    const nextQuantity = type === "add" ? quantity + 1 : quantity - 1;
    if (nextQuantity < 1) return;

    setLoading(true);
    try {
      const { data } = await baseApi.patch("/cart/edit", { id, qty: nextQuantity });
      if (!data.success) throw new Error(data.message || data.data || "Unable to update quantity");
      dispatch(set_cart(cart.map((item) => item.id === id ? { ...item, quantity: nextQuantity } : item)));
    } catch (error) {
      alert(error.message || "Unable to update quantity");
    } finally {
      setLoading(false);
    }
  }

  async function checkout() {
    if (!cart.length || loading) return;
    setLoading(true);

    try {
      const response = await baseApi.post("/checkout/cart", {});
      if (!response.data?.success) {
        throw new Error(response.data?.data || response.data?.message || "Unable to initialize checkout");
      }

      const authorizationUrl = response.data.data.authorization_url;
      if (!authorizationUrl) throw new Error("Paystack did not return a checkout URL");

      window.location.assign(authorizationUrl);
    } catch (error) {
      alert(error.message || "Unable to initialize payment");
      setLoading(false);
    }
  }

  const subtotal = cart.reduce(
    (total, item) => Number(total) + Number(item.price) * Number(item.quantity),
    0,
  );
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="cart-card">
      <h2 className="cart-title">Your order</h2>

      <div className="cart-items">
        {cart.map((item) => (
          <div className="cart-item" key={item.id}>
            <button
              className="remove-item"
              onClick={() => removeFromCart(item.id)}
              disabled={loading}
              aria-label={`Remove ${item.name}`}
            >
              ×
            </button>

            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <p>₦{new Intl.NumberFormat("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(item.price))}</p>
            </div>

            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={() => updateQuantity("reduce", Number(item.quantity), item.id)}
                disabled={loading || Number(item.quantity) <= 1}
              >−</button>
              <span className="quantity">{item.quantity}</span>
              <button
                className="quantity-btn"
                onClick={() => updateQuantity("add", Number(item.quantity), item.id)}
                disabled={loading || Number(item.quantity) >= Number(item.stock)}
              >+</button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-summary">
        <div className="summary-row">
          <span>Subtotal</span>
          <span>₦{subtotal.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="summary-row">
          <span>Delivery fee</span>
          <span>Free</span>
        </div>
        <div className="summary-row total-row">
          <span>Total</span>
          <span>₦{total.toLocaleString("en-NG", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <button className="checkout-btn" onClick={checkout} disabled={loading || !cart.length}>
        {loading ? "Processing..." : `Checkout ₦${total.toLocaleString("en-NG")}`}
      </button>
    </div>
  );
}
