"use client"
import { useRouter } from "next/navigation";
import "./styles/xxl.css";

export default function Store() {

    let router = useRouter();

    const products = [
        {
            id: 1,
            thumbnail: "https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=500",
            title: "Premium Lavender Aromatherapy Body Oil for Deep Relaxation and Nourishing Skin Care",
            price: 12000
        },
        {
            id: 2,
            thumbnail: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=500",
            title: "Intensive Hydrating Face Cream with Natural Botanical Ingredients for Radiant Healthy Skin",
            price: 8500
        },
        {
            id: 3,
            thumbnail: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=500",
            title: "Luxury Aromatherapy Bath Salt for Ultimate Relaxation, Stress Relief and Rejuvenation",
            price: 6500
        },
        {
            id: 4,
            thumbnail: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=500",
            title: "Advanced Vitamin C Facial Serum for Brighter, Smoother and More Youthful Looking Skin",
            price: 15000
        }
    ];


    function handleClick(p){
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
                                    backgroundImage: `url(${p.thumbnail})`
                                }}>
                                    <div className="card-button">
                                        <button className="btn">
                                            Add To Cart
                                        </button>
                                        <button className="btn">
                                            Buy Now
                                        </button>
                                    </div>
                                    {/* <img src={p.thumbnail ?? ""} style={{height: "100%", width: "100%"}} alt="product-image" /> */}
                                </div>

                                <div className="customer-store-product-body" onClick={() => handleClick(p)}>
                                    <p className="customer-store-product-title">
                                        {p.title ?? "Product title"}
                                    </p>
                                    <div className="customer-store-product-price">
                                        {p.price ?? "0.00"}
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