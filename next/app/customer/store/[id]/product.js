"use client";

import Link from "next/link";
import Product from "@/src/components/customer/Product/Product";
import SimilarProducts from "@/src/components/customer/Product/SimilarProds";
import "./styles/xxl.css";
import "./styles/mobile.css";
import "./styles/tablet.css";
import "./styles/ipad.css";

export default function ProductPageClient({ product }) {
  return (
    <main className="dsc-pdp-page">
      <nav className="dsc-pdp-breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/store">Shop</Link>
        {product?.category && <>
          <span aria-hidden="true">/</span>
          <span>{product.category}</span>
        </>}
      </nav>

      <Product item={product} key={product?.id} />

      <div className="dsc-pdp-related">
        <SimilarProducts productId={product?.id} category={product?.category} />
      </div>
    </main>
  );
}
