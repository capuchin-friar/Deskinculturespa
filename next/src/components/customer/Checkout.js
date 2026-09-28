"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePaystackPayment } from "react-paystack";
import {
  IoArrowBackOutline,
  IoBagHandleOutline,
  IoCheckmarkCircleOutline,
  IoLockClosedOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { useSelector } from "react-redux";
import locations from "../../../src/json/location.json";

const formatPrice = (value) =>
  new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const publicKey = "pk_test_9d54d1840154258f2371f52ac12b73e19b25dada";

const initialDetails = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  state: "",
  town: "",
  street: "",
};

export default function Checkout() {
  const cart = useSelector((state) => state.cart?.cart || []);
  const [details, setDetails] = useState(initialDetails);
  const [touched, setTouched] = useState({});
  const [paymentState, setPaymentState] = useState(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const subtotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.price || 0) * Number(item.quantity || 0),
        0,
      ),
    [cart],
  );
  const total = subtotal;
  const selectedLocation = locations.find((location) => location.name === details.state);
  const itemCount = cart.reduce((count, item) => count + Number(item.quantity || 0), 0);
  const readyToPay =
    cart.length > 0 &&
    Object.values(details).every((value) => value.trim().length > 0) &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email);

  const fieldError = (name) => {
    if (!touched[name]) return "";
    if (!details[name].trim()) return "This field is required.";
    if (name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) {
      return "Enter a valid email address.";
    }
    return "";
  };

  const updateDetail = (event) => {
    const { name, value } = event.target;
    setPaymentState(null);
    setDetails((current) => ({
      ...current,
      [name]: value,
      ...(name === "state" ? { town: "" } : {}),
    }));
  };

  const paystackConfig = useMemo(() => ({
    publicKey,
    email: details.email,
    amount: Math.round(total * 100),
    currency: "NGN",
    firstname: details.firstName,
    lastname: details.lastName,
    phone: details.phone,
    metadata: {
      custom_fields: [
        { display_name: "Delivery state", variable_name: "delivery_state", value: details.state },
        { display_name: "Delivery town", variable_name: "delivery_town", value: details.town },
        { display_name: "Delivery address", variable_name: "delivery_address", value: details.street },
      ],
    },
  }), [details, total]);
  const initializePayment = usePaystackPayment(paystackConfig);

  const beginPayment = () => {
    if (!readyToPay || isProcessingPayment || paymentState?.type === "success") return;
    setPaymentState(null);
    setIsProcessingPayment(true);
    initializePayment({
      onSuccess: (response) => {
        setIsProcessingPayment(false);
        setPaymentState({ type: "success", reference: response?.reference });
      },
      onClose: () => {
        setIsProcessingPayment(false);
        setPaymentState({ type: "cancelled" });
      },
    });
  };

  if (cart.length === 0) {
    return (
      <section className="dsc-checkout dsc-checkout--empty" aria-labelledby="dsc-checkout-title">
        <div className="dsc-checkout-empty-card">
          <span className="dsc-checkout-empty-icon" aria-hidden="true"><IoBagHandleOutline /></span>
          <p className="dsc-checkout-eyebrow">YOUR ORDER</p>
          <h1 id="dsc-checkout-title">Your bag is empty</h1>
          <p>Add something to your bag before you check out.</p>
          <Link className="dsc-checkout-secondary-link" href="/store">Explore the store</Link>
        </div>
      </section>
    );
  }

  return (
    <main className="dsc-checkout" aria-labelledby="dsc-checkout-title">
      <div className="dsc-checkout-inner">
        <nav className="dsc-checkout-breadcrumb" aria-label="Checkout progress">
          <Link href="/customer/store/cart"><IoArrowBackOutline aria-hidden="true" /> Back to bag</Link>
          <span aria-current="step">Checkout</span>
        </nav>

        {/* <header className="dsc-checkout-heading">
          <p className="dsc-checkout-eyebrow">A LITTLE SELF-CARE, ON ITS WAY</p>
          <h1 id="dsc-checkout-title">Checkout</h1>
          <p>Review your details and complete your payment.</p>
        </header> */}

        {paymentState?.type === "success" && (
          <div className="dsc-checkout-alert dsc-checkout-alert--success" role="status">
            <IoCheckmarkCircleOutline aria-hidden="true" />
            <div>
              <strong>Paystack returned a successful payment response.</strong>
              <span>Reference: {paymentState.reference || "Not provided"}. Keep this reference for your records.</span>
              <span>This checkout currently does not create or verify an order.</span>
            </div>
          </div>
        )}
        {paymentState?.type === "cancelled" && (
          <div className="dsc-checkout-alert dsc-checkout-alert--notice" role="status">
            <span><strong>Payment window closed.</strong> No payment confirmation was received. You can review your details and try again.</span>
          </div>
        )}

        <div className="dsc-checkout-layout">
          <div className="dsc-checkout-form-column">
            <section className="dsc-checkout-section" aria-labelledby="dsc-contact-title">
              <div className="dsc-checkout-section-heading">
                <span className="dsc-checkout-step">01</span>
                <div>
                  <h2 id="dsc-contact-title">Contact details</h2>
                  <p>We’ll use these details for your payment.</p>
                </div>
              </div>
              <div className="dsc-checkout-fields">
                <label className={`dsc-checkout-field${fieldError("firstName") ? " has-error" : ""}`}>
                  <span>First name <b aria-hidden="true">*</b></span>
                  <input autoComplete="given-name" name="firstName" value={details.firstName} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, firstName: true }))} aria-invalid={Boolean(fieldError("firstName"))} required />
                  {fieldError("firstName") && <small>{fieldError("firstName")}</small>}
                </label>
                <label className={`dsc-checkout-field${fieldError("lastName") ? " has-error" : ""}`}>
                  <span>Last name <b aria-hidden="true">*</b></span>
                  <input autoComplete="family-name" name="lastName" value={details.lastName} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, lastName: true }))} aria-invalid={Boolean(fieldError("lastName"))} required />
                  {fieldError("lastName") && <small>{fieldError("lastName")}</small>}
                </label>
                <label className={`dsc-checkout-field${fieldError("email") ? " has-error" : ""}`}>
                  <span>Email address <b aria-hidden="true">*</b></span>
                  <input autoComplete="email" name="email" type="email" inputMode="email" value={details.email} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, email: true }))} aria-invalid={Boolean(fieldError("email"))} required />
                  {fieldError("email") && <small>{fieldError("email")}</small>}
                </label>
                <label className={`dsc-checkout-field${fieldError("phone") ? " has-error" : ""}`}>
                  <span>Phone number <b aria-hidden="true">*</b></span>
                  <input autoComplete="tel" name="phone" type="tel" inputMode="tel" value={details.phone} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, phone: true }))} aria-invalid={Boolean(fieldError("phone"))} required />
                  {fieldError("phone") && <small>{fieldError("phone")}</small>}
                </label>
              </div>
            </section>

            <section className="dsc-checkout-section" aria-labelledby="dsc-delivery-title">
              <div className="dsc-checkout-section-heading">
                <span className="dsc-checkout-step">02</span>
                <div>
                  <h2 id="dsc-delivery-title">Delivery address</h2>
                  <p>Choose a state and town, then add your street address.</p>
                </div>
              </div>
              <div className="dsc-checkout-fields">
                <label className={`dsc-checkout-field${fieldError("state") ? " has-error" : ""}`}>
                  <span>State <b aria-hidden="true">*</b></span>
                  <select autoComplete="address-level1" name="state" value={details.state} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, state: true }))} aria-invalid={Boolean(fieldError("state"))} required>
                    <option value="">Select your state</option>
                    {locations.map((location) => <option key={location.name} value={location.name}>{location.name}</option>)}
                  </select>
                  {fieldError("state") && <small>{fieldError("state")}</small>}
                </label>
                <label className={`dsc-checkout-field${fieldError("town") ? " has-error" : ""}`}>
                  <span>Town / city <b aria-hidden="true">*</b></span>
                  <select autoComplete="address-level2" name="town" value={details.town} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, town: true }))} aria-invalid={Boolean(fieldError("town"))} required disabled={!selectedLocation}>
                    <option value="">{selectedLocation ? "Select your town" : "Select a state first"}</option>
                    {(selectedLocation?.cities || []).map((city) => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {fieldError("town") && <small>{fieldError("town")}</small>}
                </label>
                <label className={`dsc-checkout-field dsc-checkout-field--full${fieldError("street") ? " has-error" : ""}`}>
                  <span>Street address <b aria-hidden="true">*</b></span>
                  <input autoComplete="street-address" name="street" value={details.street} onChange={updateDetail} onBlur={() => setTouched((current) => ({ ...current, street: true }))} aria-invalid={Boolean(fieldError("street"))} placeholder="House number and street name" required />
                  {fieldError("street") && <small>{fieldError("street")}</small>}
                </label>
              </div>
              <div className="dsc-checkout-delivery-note">
                <IoShieldCheckmarkOutline aria-hidden="true" />
                <span>Delivery fee is free at checkout. Delivery options and estimates aren’t currently available here.</span>
              </div>
            </section>

            <section className="dsc-checkout-section dsc-checkout-payment" aria-labelledby="dsc-payment-title">
              <div className="dsc-checkout-section-heading">
                <span className="dsc-checkout-step">03</span>
                <div>
                  <h2 id="dsc-payment-title">Payment</h2>
                  <p>Continue to Paystack to complete your payment.</p>
                </div>
              </div>
              <div className="dsc-checkout-payment-method">
                <span className="dsc-checkout-payment-mark" aria-hidden="true"><IoLockClosedOutline /></span>
                <span><strong>Paystack</strong><small>Card and other available payment options</small></span>
                <span className="dsc-checkout-payment-total">₦{formatPrice(total)}</span>
              </div>
              <button
                className="dsc-checkout-pay-button"
                type="button"
                onClick={beginPayment}
                disabled={!readyToPay || isProcessingPayment || paymentState?.type === "success"}
              >
                {isProcessingPayment ? "Opening Paystack…" : `Pay ₦${formatPrice(total)}`}
              </button>
              {!readyToPay && <p className="dsc-checkout-hint">Complete all required fields with a valid email to continue.</p>}
              <p className="dsc-checkout-secure-note"><IoLockClosedOutline aria-hidden="true" /> Payment details are entered in the Paystack payment window.</p>
            </section>
          </div>

          <aside className="dsc-checkout-summary" aria-labelledby="dsc-summary-title">
            <button className="dsc-checkout-summary-toggle" type="button" aria-expanded={summaryOpen} onClick={() => setSummaryOpen((open) => !open)}>
              <span>Your order <span className="dsc-checkout-count">{itemCount} {itemCount === 1 ? "item" : "items"}</span></span>
              <strong>₦{formatPrice(total)}</strong>
            </button>
            <div className={`dsc-checkout-summary-content${summaryOpen ? " is-open" : ""}`}>
              <h2 id="dsc-summary-title">Order summary <span>{itemCount} {itemCount === 1 ? "item" : "items"}</span></h2>
              <ul className="dsc-checkout-items">
                {cart.map((item) => (
                  <li className="dsc-checkout-item" key={item.id}>
                    <div className="dsc-checkout-item-image">
                      {item.thumbnail_url ? <img src={item.thumbnail_url} alt="" /> : <IoBagHandleOutline aria-hidden="true" />}
                      <span>{item.quantity}</span>
                    </div>
                    <div className="dsc-checkout-item-info"><strong>{item.name}</strong><span>Qty {item.quantity}</span></div>
                    <strong className="dsc-checkout-item-price">₦{formatPrice(Number(item.price) * Number(item.quantity))}</strong>
                  </li>
                ))}
              </ul>
              <div className="dsc-checkout-totals">
                <div><span>Subtotal</span><span>₦{formatPrice(subtotal)}</span></div>
                <div><span>Delivery</span><span className="dsc-checkout-free">Free</span></div>
                <div className="dsc-checkout-grand-total"><span>Total</span><strong>₦{formatPrice(total)}</strong></div>
              </div>
              <p className="dsc-checkout-summary-footnote">Final delivery arrangements aren’t collected or confirmed by this checkout.</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
