// import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import App from "../App";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const Metadata = {
  title: "DeSkinCulture",
  description: "Where Skin Gets the Care It Deserves.",
};

import StructuredData from "./StructuredData";

export async function generateMetadata() {
  const imageUrl = "https://www.deskinculture.com/api/logo";

  return {
    title: "DeSkinCulture | Where Skin Gets the Care It Deserves",
    description:
      "From relaxing spa treatments to targeted skincare solutions, our goal is to create experiences that feel thoughtful, comfortable, and genuinely useful.",
    alternates: { canonical: "https://www.deskinculture.com" },
    robots: { index: true, follow: true },
    openGraph: {
      title: "DeSkinCulture | Where Skin Gets the Care It Deserves",
      description:
        "From relaxing spa treatments to targeted skincare solutions, our goal is to create experiences that feel thoughtful, comfortable, and genuinely useful.",
      url: "https://www.deskinculture.com",
      type: "website",
      images: [{ url: imageUrl, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: "DeSkinCulture | Where Skin Gets the Care It Deserves",
      description:
        "From relaxing spa treatments to targeted skincare solutions, our goal is to create experiences that feel thoughtful, comfortable, and genuinely useful.",
      images: [imageUrl],
    },
  };
}

const productSchema = await fetch("https://www.deskinculture.com/api/json-ld", {
  next: { revalidate: 3600 },
})
  .then((res) => (res.ok ? res.json() : null))
  .then((data) => (data?.success ? data.data : null))
  .catch(() => null);

// const CATEGORY_NAMES = [
//   "apparel & accessories",
//   "beauty",
//   "jewelry & watches & eyewear",
//   "shoes & accessories",
//   "home appliances",
//   "lights & lighting",
//   "kitchenware & cookware",
//   "storage & organizations",
//   "electronics",
//   "toiletries",
// ];

// function categoryPath(name) {
//   return `/store/${encodeURIComponent(name.replaceAll(" ", ""))}`;
// }

export default async function RootLayout({ children }) {
  // const categories = CATEGORY_NAMES.map((title) => ({
  //   title,
  //   uri: categoryPath(title),
  // }));

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DeSkinCulture",
    url: "https://www.deskinculture.com/",
    logo: "https://res.cloudinary.com/daqbhghwq/image/upload/v1791192261/deskinculture_logo_cnyrcj.png",
    sameAs: [
      "https://www.tiktok.com/@deskinculturespa12?_r=1&_t=ZS-9AHYvvOnyrZ",
      "https://www.instagram.com/deskinculture?stkn=b2p3OWkyNTJpdGs5&utm_source=qr",
      "https://www.facebook.com/dskinculture?mibextid=wwXIfr&rdid=VV6cQmYbB0wD7XWB&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F18Qf6He6kx%2F%3Fmibextid%3DwwXIfr#",
      "https://www.youtube.com/@DeskinCulturespa",
    ],
    description:
      "From relaxing spa treatments to targeted skincare solutions, our goal is to create experiences that feel thoughtful, comfortable, and genuinely useful.",
    hasPart: [
      {
        "@type": "SiteNavigationElement",
        name: "Sign Up",
        url: "https://www.deskinculture.com/signup",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Sign In",
        url: "https://www.deskinculture.com/login",
      },
      {
        "@type": "SiteNavigationElement",
        name: "Place Your Order",
        url: "https://www.deskinculture.com/store",
      },
      // ...categories.map((cat) => ({
      //   "@type": "SiteNavigationElement",
      //   name: cat.title,
      //   url: `https://www.deskinculture.com/${cat.uri}`,
      // })),
    ],
  };
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <title>DeSkinCulture — Where Skin Gets the Care It Deserves.</title>
        <meta
          name="description"
          content="From relaxing spa treatments to targeted skincare solutions, our goal is to create experiences that feel thoughtful, comfortable, and genuinely useful."
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
          rel="stylesheet"
          integrity="sha384-sRIl4kxILFvY47J16cr9ZwB07vP4J8+LH7qKQnuqkuIAvNWLzeN8tE5YBujZqJLB"
          crossOrigin="anonymous"
        />
        <StructuredData data={websiteSchema} />
        {productSchema && <StructuredData data={productSchema} />}
      </head>
      <body className="min-h-full flex flex-col">
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-FKyoEForCGlyvwx9Hj09JcYn3nv7wiPVlz7YYwJrWVcXK/BmnVDxM+D2scQbITxI"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <App>{children}</App>
      </body>
    </html>
  );
}
