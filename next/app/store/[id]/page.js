export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProductPageClient from "./product";
import { absoluteUrl } from "../../api/shared/config";

function productApiUrl(id) {
  return absoluteUrl(`/api/customers/product?id=${encodeURIComponent(id)}`);
}

export async function generateMetadata({ params }) {
  const { id } = await params;

  console.log("Product ID:", id);

  if (!id) {
    return {
      title: "Product Not Found",
    };
  }

  try {
    const res = await fetch(productApiUrl(id), {
        method: "GET",
        cache: "no-store",
      });

    if (!res.ok) {
      return;
    }

    const { data: product } = await res.json();

    console.log("Product:", product);

    if (!product || Object.keys(product).length === 0) {
      return {
        title: "Product Not Found",
      };
    }

    const thumbnail = product?.thumbnail_url;

    const isImg =
      thumbnail &&
      ["jpg", "jpeg", "png", "gif", "webp"].includes(
        thumbnail.split("?")[0].split(".").pop()?.toLowerCase()
      );

    const formattedTitle = `${
      product?.name || "Product"
    } - ₦${new Intl.NumberFormat("en-NG").format(
      Number(product?.price || 0)
    )}`;

    const productUrl = absoluteUrl(`/store/${product.id}`);

    return {
      title: formattedTitle,

      description: product?.description || "",

      alternates: {
        canonical: productUrl,
      },

      robots: {
        index: true,
        follow: true,
      },

      openGraph: {
        title: formattedTitle,
        description: product?.description || "",
        url: productUrl,
        type: isImg ? "website" : "video.other",

        ...(isImg && thumbnail
          ? {
              images: [
                {
                  url: thumbnail,
                  width: 1200,
                  height: 630,
                },
              ],
            }
          : {}),
      },

      twitter: {
        card: isImg ? "summary_large_image" : "summary",
        title: formattedTitle,
        description: product?.description || "",

        ...(isImg && thumbnail
          ? {
              images: [thumbnail],
            }
          : {}),
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);

    return {
      title: "Product Details - De Skin Culture",
    };
  }
}

export default async function ProductPage({ params }) {
  const { id } = await params;

  console.log("Product ID:", id);

  if (!id) {
    return <div>Error: No product ID provided.</div>;
  }

  const res = await fetch(productApiUrl(id), {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    return;
  }

  const { data: product } = await res.json();

  console.log("Product:", product);

  if (!product || Object.keys(product).length === 0) {
    return <div>Product not found.</div>;
  }

  return <ProductPageClient product={product} />;
}
