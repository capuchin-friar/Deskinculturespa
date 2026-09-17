"use client"
import { useRouter } from "next/navigation";
import "./styles/xxl.css";
import { useEffect, useState } from "react";
import Formatter from "../../src/utils/formatter";
import useToggler from "../../src/hooks/toggler";
import { useSelector } from "react-redux";
import useProductHandler from "../../src/hooks/product";

export default function Store({ }) {

    let {
        filters
    } = useSelector(s => s.filters);

    let router = useRouter();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();
    const {
        products: prods
    } = useProductHandler();

    useEffect(() => {
        setProducts(prods)
    }, [prods]);

    useEffect(() => { implementFilter(filters) }, [filters, products]);



    function implementFilter(filter) {
        let filtered = products;

        if (filter.price) {
            filtered = filtered.filter(
                (p) =>
                    Number(p.price) >= Number(filter.price.min) &&
                    Number(p.price) <= Number(filter.price.max)
            );
        }

        if (filter.category && filter.category !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.category?.toLowerCase() ===
                    filter.category.toLowerCase()
            );
        }

        if (filter.subCategory && filter.subCategory !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.subcategory?.toLowerCase() ===
                    filter.subCategory.toLowerCase()
            );
        }

        if (filter.brand && filter.brand !== "") {
            filtered = filtered.filter(
                (p) =>
                    p.brand?.toLowerCase() ===
                    filter.brand.toLowerCase()
            );
        }

        console.log("filtered: ", filtered)
        setFilteredProducts(filtered);
    }


    function handleClick(p) {
        router.push(`/store/${p.id}`);
    }


    return (
        <>
            <div className="customer-store">
                <div className="customer-store-product-card-cnt">
                    {
                        filteredProducts.map((p, i) =>
                            <div className="customer-store-product-card shadow-sm">
                                <div className="customer-store-product-thumbnail" style={{
                                    backgroundImage: `url(${p.thumbnail_url})`
                                }}>
                                    <div className="card-button" style={{ justifyContent: 'center' }}>
                                        <button className="btn" style={{ background: "transparent", color: "#fff", fontWeight: "500" }} onClick={async () => {
                                            let isProductCarted = isCarted(p.id);

                                            if (isProductCarted) {
                                                await rmFromCart(p.id);
                                            } else {
                                                await addToCart({ item: p, qty: 1 })
                                            }
                                        }}>
                                            {
                                                isCarted(p.id) ? "Remove From Cart" : "Add To Cart"
                                            }
                                        </button>
                                        {/* <button className="btn">
                                            Buy Now
                                        </button> */}
                                    </div>
                                    {/* <img src={p.thumbnail ?? ""} style={{height: "100%", width: "100%"}} alt="product-image" /> */}
                                </div>

                                <div className="customer-store-product-body" onClick={() => handleClick(p)}>
                                    <p className="customer-store-product-title">
                                        {p.name ?? "Product title"}
                                    </p>
                                    <div className="customer-store-product-price">
                                        ₦ {Formatter.formatRevenue(p.price ?? 0)}
                                    </div>
                                </div>


                            </div>
                        )
                    }
                </div>
            </div>
        </>
    )
}