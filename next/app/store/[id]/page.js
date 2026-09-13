export const dynamic = "force-dynamic";
export const revalidate = 0;

import ProductPageClient from "./product"; // Client component
import Head from "next/head";
import { baseApi } from "../../api/config";

export async function generateMetadata({  }) {
  // const slug = params?.slug;
  let slug = 2;

  const params = {
    id: slug
  };
  if (!slug) {
    return { title: "Default Product" };
  }


  try {
    const res = await fetch(`http:localhost:3000/api/product?${new URLSearchParams(params)}`, {
      method: "GET"
    });

    if (!res.ok) throw new Error("Failed to fetch product data");

    let {
      data
    } = await res.json();
  
    let product = data;

    console.log('product: ', product)
    if (!product || Object.keys(product).length === 0) {
      return { title: "Product Not Found" };
    }

    const isImg = ["jpg", "jpeg", "png", "gif", "webp"].includes(
      product?.thumbnail_url?.split(".").pop()?.toLowerCase()
    );
    const thumbnail = product?.thumbnail_url || slug;
    const videoUrl = product?.thumbnail_url; // If video is applicgitable

    const formattedTitle = `${product?.name || slug} - ₦${new Intl.NumberFormat(
      "en-US"
    ).format(product?.price)}`;

    return {
      title: formattedTitle,
      alternates: {
        canonical: `https://www.deskinculture.com/store/${product?.id}`,
      },
      url: `https://www.deskinculture.com/store/${product?.id}`,
      robots: {
        index: true,
        follow: true,
      },
      openGraph: {
        title: formattedTitle,
        description: product?.description || "",
        url: `https://www.deskinculture.com/store/${product?.id}`,
        type: isImg ? "website" : "video.other",
        ...(isImg
          ? {
            images: [{ url: thumbnail, width: 1200, height: 630 }],
          }
          : {
            videos: [
              {
                url: videoUrl,
                secure_url: videoUrl,  // 👈 Add this for HTTPS
                width: 1280,
                height: 720,
                type: "video/mp4",
              },
            ],
          }),
      },
      twitter: {
        card: isImg ? "summary_large_image" : "player",
        title: formattedTitle,
        description: product?.description || "",
        ...(isImg
          ? { images: [thumbnail] }
          : {
            player: videoUrl,
            playerStream: videoUrl, // Direct MP4 link
            playerStreamContentType: "video/mp4",
            playerWidth: 1280,
            playerHeight: 720
          }
        ),
      },
    };
  } catch (error) {
    console.error("Metadata fetch error:", error);
    return { title: "Product Details - DeskinCulture" };
  }
}

export default async function ProductPage({  }) {
  let slug;
  // const { slug } = params;
  const params = {
    id: 2
  };
  let product = null;

  const res = await fetch(`http:localhost:3000/api/product?${new URLSearchParams(params)}`, {
    method: "GET"
  });

  if (!res.ok) throw new Error("Failed to fetch product data");

  let {
    data
  } = await res.json();

  product = data;
  console.log('product: ', product)

  // if (!slug) {
  //   return <div>Error: No product slug provided.</div>;
  // }



  return <ProductPageClient
    // slug={slug} 
    product={product}
  />;
}
