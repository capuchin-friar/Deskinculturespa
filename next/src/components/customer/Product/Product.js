"use client";

import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import Image from "next/image";
import { IoChevronBack, IoChevronForward, IoCubeOutline, IoImageOutline } from "react-icons/io5";
import { baseApi } from "@/app/api/shared/config";
import useToggler from "@/src/hooks/toggler";

const getImageUrl = (image) => {
  if (typeof image === "string") return image.trim();
  if (image && typeof image === "object") {
    return String(image.secure_url || image.url || image.src || "").trim();
  }
  return "";
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-NG", { maximumFractionDigits: 0 }).format(Number(price) || 0);

export default function Product({ item }) {
  const { cart } = useSelector((state) => state.cart);
  const { addToCart, rmFromCart, refreshCart } = useToggler();
  const [activeImage, setActiveImage] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [cartMessage, setCartMessage] = useState("");
  const touchStartX = useRef(null);

  const candidates = [item?.thumbnail_url, ...(Array.isArray(item?.images) ? item.images : [])]
    .map(getImageUrl)
    .filter(Boolean);
  const images = [...new Set(candidates)];

  const cartItem = cart.find((entry) => String(entry.product_id) === String(item?.id));
  const stock = Number(item?.stock);
  const hasStockValue = item?.stock !== null && item?.stock !== undefined && Number.isFinite(stock);
  const outOfStock = hasStockValue && stock <= 0;
  const maxQuantity = hasStockValue && stock > 0 ? Math.min(99, stock) : 99;
  const currentQuantity = cartItem
    ? Math.max(1, Math.min(Number(cartItem.quantity) || 1, maxQuantity))
    : quantity;
  const currentImage = images[activeImage] || "";

  const showImage = (index) => {
    if (!images.length) return;
    setActiveImage((index + images.length) % images.length);
    setImageFailed(false);
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null || images.length < 2) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 45) showImage(activeImage + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  };

  const changeQuantity = async (nextQuantity) => {
    const next = Math.max(1, Math.min(maxQuantity, nextQuantity));
    setCartMessage("");
    if (!cartItem) {
      setQuantity(next);
      return;
    }

    setBusy(true);
    try {
      const { data } = await baseApi.patch("/customers/cart/edit", {
        id: String(cartItem.id),
        qty: next,
      });
      if (!data?.success) throw new Error(data?.message || "Could not update quantity.");
      await refreshCart();
    } catch (error) {
      setCartMessage(error?.message || "Could not update quantity. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const handleCartAction = async () => {
    setBusy(true);
    setCartMessage("");
    try {
      const succeeded = cartItem
        ? await rmFromCart(cartItem.product_id)
        : await addToCart({ item: { ...item, id: String(item.id) }, qty: currentQuantity });
      if (!succeeded) throw new Error(cartItem ? "Could not remove this product from your bag." : "Could not add this product to your bag.");
      setCartMessage(cartItem ? "Removed from your bag." : "Added to your bag.");
      if (cartItem) setQuantity(1);
    } catch (error) {
      setCartMessage(error?.message || "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const productName = item?.name || item?.title || "Product";

  return (
    <section className="dsc-pdp" aria-labelledby="dsc-pdp-title">
      <div className="dsc-pdp__hero">
        <div className="dsc-pdp__gallery" aria-label="Product images">
          <div
            className="dsc-pdp__image-stage"
            onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
            onTouchEnd={handleTouchEnd}
          >
            {currentImage && !imageFailed ? (
              <Image
                className="dsc-pdp__main-image"
                src={currentImage}
                alt={productName}
                width={1000}
                height={1000}
                unoptimized
                onError={() => setImageFailed(true)}
              />
            ) : (
              <div className="dsc-pdp__image-placeholder" role="img" aria-label={`${productName} image unavailable`}>
                <IoImageOutline aria-hidden="true" />
                <span>Product image unavailable</span>
              </div>
            )}

            {images.length > 1 && (
              <>
                <button className="dsc-pdp__gallery-arrow dsc-pdp__gallery-arrow--previous" type="button" onClick={() => showImage(activeImage - 1)} aria-label="Previous product image">
                  <IoChevronBack aria-hidden="true" />
                </button>
                <button className="dsc-pdp__gallery-arrow dsc-pdp__gallery-arrow--next" type="button" onClick={() => showImage(activeImage + 1)} aria-label="Next product image">
                  <IoChevronForward aria-hidden="true" />
                </button>
                <span className="dsc-pdp__image-count">{activeImage + 1} / {images.length}</span>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="dsc-pdp__thumbnails" aria-label="Choose a product image">
              {images.map((image, index) => (
                <button
                  className={`dsc-pdp__thumbnail${index === activeImage ? " is-active" : ""}`}
                  type="button"
                  key={`${image}-${index}`}
                  onClick={() => showImage(index)}
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={index === activeImage}
                >
                  <Image src={image} alt="" width={120} height={120} unoptimized loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="dsc-pdp__summary">
          {(item?.brand || item?.category) && (
            <div className="dsc-pdp__eyebrow">
              {item?.brand && <span>{item.brand}</span>}
              {item?.brand && item?.category && <span aria-hidden="true">·</span>}
              {item?.category && <span>{item.category}</span>}
            </div>
          )}

          <h1 className="dsc-pdp__title" id="dsc-pdp-title">{productName}</h1>

          <p className="dsc-pdp__price">₦{formatPrice(item?.price)}</p>

          {item?.description && <p className="dsc-pdp__intro">{item.description}</p>}

          {hasStockValue && (
            <div className={`dsc-pdp__availability${outOfStock ? " is-out-of-stock" : ""}`}>
              <IoCubeOutline aria-hidden="true" />
              <span>{outOfStock ? "Currently unavailable" : `${stock} ${stock === 1 ? "unit" : "units"} available`}</span>
            </div>
          )}

          <div className="dsc-pdp__purchase">
            <div className="dsc-pdp__quantity-field">
              <span className="dsc-pdp__field-label">Quantity</span>
              <div className="dsc-pdp__quantity" aria-label="Product quantity">
                <button type="button" onClick={() => changeQuantity(currentQuantity - 1)} disabled={busy || currentQuantity <= 1 || outOfStock} aria-label="Decrease quantity">−</button>
                <output aria-live="polite">{currentQuantity}</output>
                <button type="button" onClick={() => changeQuantity(currentQuantity + 1)} disabled={busy || currentQuantity >= maxQuantity || outOfStock} aria-label="Increase quantity">+</button>
              </div>
            </div>

            <button className="dsc-pdp__cart-button" type="button" onClick={handleCartAction} disabled={busy || outOfStock}>
              {busy ? "Updating…" : cartItem ? "Remove from bag" : "Add to bag"}
            </button>
          </div>

          <p className="dsc-pdp__cart-message" role="status" aria-live="polite">{cartMessage}</p>

          <div className="dsc-pdp__product-meta">
            {item?.brand && <div><span>Brand</span><strong>{item.brand}</strong></div>}
            {item?.category && <div><span>Category</span><strong>{item.category}</strong></div>}
            {item?.subcategory && <div><span>Collection</span><strong>{item.subcategory}</strong></div>}
          </div>
        </div>
      </div>

      {item?.description && (
        <section className="dsc-pdp__details" aria-labelledby="dsc-pdp-description">
          <div className="dsc-pdp__section-heading">
            <span>GET TO KNOW IT</span>
            <h2 id="dsc-pdp-description">Product details</h2>
          </div>
          <p>{item.description}</p>
        </section>
      )}
    </section>
  );
}
