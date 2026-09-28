"use client";

import { useRef } from "react";
import Image from "next/image";
import {
    IoChevronBack,
    IoChevronForward,
    IoCartOutline,
} from "react-icons/io5";

import "./similar_products.css";
import useToggler from "../../../hooks/toggler";
import { useRouter } from "next/navigation";
import useProductHandler from "../../../hooks/product";

export default function SimilarProducts({ productId, category }) {
    const carouselRef = useRef(null);
    const router = useRouter();



    const scroll = (direction) => {
        if (!carouselRef.current) return;

        const amount = 320;

        carouselRef.current.scrollBy({
            left: direction === "left" ? -amount : amount,
            behavior: "smooth",
        });
    };

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();


    const { products } = useProductHandler();

    const relatedProducts = products.filter((product) =>
        String(product.id) !== String(productId) &&
        (!category || product.category?.toLowerCase() === category.toLowerCase())
    );

    if (!relatedProducts.length) return null;

    return (
        <section className="similar-products">

            {/* HEADER */}

            <div className="similar-products-header">

                <div>
                    <span className="similar-products-label">
                        YOU MAY ALSO LIKE
                    </span>

                    {/* <h2>Similar Products</h2> */}

                    {/* <p>
                        Discover more products you might love.
                    </p> */}
                </div>


                <div className="carousel-controls">

                    <button
                        type="button"
                        onClick={() => scroll("left")}
                        aria-label="Previous products"
                    >
                        <IoChevronBack />
                    </button>

                    <button
                        type="button"
                        onClick={() => scroll("right")}
                        aria-label="Next products"
                    >
                        <IoChevronForward />
                    </button>

                </div>

            </div>


            {/* CAROUSEL */}

            <div
                className="similar-products-carousel"
                ref={carouselRef}
            >

                {relatedProducts.map((product) => (

                    <article
                        className="similar-product-card"
                        key={product.id}
                    >

                        {/* IMAGE */}

                        <div className="similar-product-image" onClick={() => {
                            router.push(`/customer/store/${product.id}`)
                        }}>

                            <Image
                                src={product.thumbnail_url}
                                alt={product.name}
                                width={600}
                                height={600}
                                unoptimized
                            />

                        </div>


                        {/* CONTENT */}

                        <div className="similar-product-content" >

                            <h3 title={product.name} style={{ padding: "unset" }} onClick={() => {
                            router.push(`/customer/store/${product.id}`)
                            }}>
                                {product.name}
                            </h3>

                            <div className="similar-product-bottom">

                                <span className="similar-product-price" onClick={() => {
                                    router.push(`/customer/store/${product.id}`)
                                }}>
                                    ₦
                                    {new Intl.NumberFormat("en-NG").format(
                                        product.price
                                    )}
                                </span>

                                <button
                                    type="button"
                                    className="add-cart-button"
                                    onClick={() => {
                                        let isProdCarted = isCarted(product.id);
                                        if (isProdCarted) {
                                            rmFromCart(product.id)
                                        } else {
                                            addToCart({
                                                item: product,
                                                qty: 1
                                            })
                                        }
                                    }}
                                >
                                    <IoCartOutline />

                                    <span>{
                                        isCarted(product.id) ? "Remove From Cart" : "Add To Cart"
                                    }</span>
                                </button>

                            </div>

                        </div>

                    </article>

                ))}

            </div>

        </section>
    );
}
