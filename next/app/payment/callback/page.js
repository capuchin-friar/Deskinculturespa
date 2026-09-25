"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [state, setState] = useState({ loading: true, success: false, message: "Confirming your payment..." });

  useEffect(() => {
    if (!reference) {
      setState({ loading: false, success: false, message: "Payment reference is missing." });
      return;
    }

    fetch("/api/payments/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok || !payload.success || !payload.data?.paid) {
          throw new Error(payload.data || "Payment has not been confirmed.");
        }
        setState({ loading: false, success: true, message: "Payment confirmed. Your order has been received." });
      })
      .catch((error) => {
        setState({ loading: false, success: false, message: error.message || "Unable to confirm payment." });
      });
  }, [reference]);

  return (
    <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: 40 }}>
      <section style={{ maxWidth: 520, textAlign: "center" }}>
        <h1>{state.loading ? "Confirming payment" : state.success ? "Payment successful" : "Payment pending"}</h1>
        <p>{state.message}</p>
        {!state.loading && (
          <button type="button" onClick={() => { window.location.href = "/"; }}>
            Continue
          </button>
        )}
      </section>
    </main>
  );
}
