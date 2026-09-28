"use client";

import dynamic from "next/dynamic";
import "./styles/g.css";
import "./styles/xxl.css";
import "./styles/ipad.css";
import "./styles/tablet.css";
import "./styles/mobile.css";

const CheckoutClient = dynamic(() => import("../../../../src/components/customer/Checkout"), { ssr: false });

export default function CheckoutPage() {
  return <CheckoutClient />;
}
