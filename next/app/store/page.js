"use client"
import { useRouter } from "next/navigation";
import "./styles/xxl.css";
import { useEffect, useState } from "react";
import { baseApi } from "../api/config";
import Formatter from "../../src/utils/formatter";
import useToggler from "../../src/hooks/toggler";

export default function Store() {

    let router = useRouter();
    const [products, setProducts] = useState([]);

    const {
        addToCart,
        rmFromCart,
        isCarted
    } = useToggler();


    useEffect(() => {
        (async () => {
            let {
                data
            } = await baseApi.get("products");

            if (data.success) {
                setProducts(data.data);
            }
            if (!data.success) {
                setProducts([])
            }
        })();
    }, []);


    function handleClick(p) {
        router.push(`/store/${p.id}`);
    }


    return (
        <>
            <div className="customer-store">
                <div className="customer-store-product-card-cnt">
                    {
                        products.map((p, i) =>
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