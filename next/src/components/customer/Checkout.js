"use client";

import { useEffect, useState } from "react";
import { PaystackButton } from "react-paystack"
import { useDispatch, useSelector } from "react-redux";
import { baseApi } from "../../../app/api/config";
import { set_cart } from "../../../redux/customer/cart";

export default function CartSummary() {
    let {
        cart
    } = useSelector(s => s.cart);
    let [loading, setLoading] = useState(false);
    let dispatch = useDispatch();


    useEffect(() => {
        console.log("cart: ", cart)
    }, [cart]);

    async function RmFromCart(cartId) {
        setLoading(true)
        try {
            const {
                data,
                status
            } = await baseApi.delete("/cart/delete", {
                data: {
                    id: cartId
                }
            })

            if (!data.success) {
                setLoading(false);
                throw new Error("Error: ", data.message)
            }
            if (data.success) {
                dispatch(
                    set_cart(
                        cart.filter(c =>
                            c?.id != cartId
                        )
                    )
                );
                setLoading(false);

            }


        } catch (error) {
            console.log(error)
        }
    }

    async function updateHandler(type, qty, id) {
        setLoading(true);
        let cartQty = type === "add" ? qty + 1 : qty - 1;
        const {
            data,
            status
        } = await baseApi.patch("/cart/edit", { id, qty: cartQty });

        if (!data.success) {
            throw new Error("Error: ", data.message);
            setLoading(false)
        }
        if (data.success) {
            dispatch(
                set_cart(
                    cart.map(c =>
                        c?.id == id
                            ? { ...c, quantity: cartQty }
                            : c
                    )
                )
            );
            setLoading(false)
        }
    }


    const subtotal = cart.reduce(
        (total, item) => Number(total) + Number(item.price) * Number(item.quantity),
        0
    );

    const deliveryFee = 0;

    const total = subtotal + deliveryFee;

    const metadata = {
        user_id: "0010",
        cart_id: cart.id ?? ""
    };

    const config = {
        metadata,
        reference: `${new Date().getTime()}-${Math.floor(Math.random() * 100000)}`,
        email: "akpulufabian@gmail.com",
        amount: total * 100, // Convert to kobo
    };

    const publicKey = "pk_test_9d54d1840154258f2371f52ac12b73e19b25dada";
    const componentProps = {
        ...config,
        publicKey,
        text: ` 
            Checkout ₦${new Intl.NumberFormat("en-us").format((parseInt(total)))}
            
        `,
        onSuccess: async (reference) => {
            await fetch("/api/mssg/pending", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status: "pending",
                    buyerName: buyer_info?.fname,
                    order: order_list?.order,
                    product: order_list?.product,
                    // phone: `234${buyer_info?.phone}`,
                    buyer_locale: `${buyer_info.campus} in ${buyer_info.state}`
                }),
            });
            window.location.href = `/store/orders/${order_list?.product?.product_id}/tracker`;

        },
        onClose: () => {
            alert("Wait! You need this oil, don't go!!!!");
        },
    }

    return (
        <div className="cart-card">

            <h2 className="cart-title">
                Your order
            </h2>

            <div className="cart-items">

                {cart.map((item) => (
                    <div className="cart-item" key={item.id}>

                        <button
                            className="remove-item"
                            onClick={() => RmFromCart(item.id)}
                            aria-label={`Remove ${item.name}`}
                        >
                            ×
                        </button>

                        <div className="cart-item-info">

                            <h3>
                                {item.name}
                            </h3>

                            <p>
                                ₦{
                                    new Intl.NumberFormat("en-NG", {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2
                                    }).format(Number(item.price))
                                }
                            </p>

                        </div>

                        <div className="quantity-control">

                            <button
                                className="quantity-btn"
                                onClick={() => updateHandler("reduce", Number(item.quantity), item.id)}
                                disabled={loading || Number(item.quantity) <= 1}
                            >
                                −
                            </button>

                            <span className="quantity">
                                {item.quantity}
                            </span>

                            <button
                                className="quantity-btn"
                                onClick={() => updateHandler("add", Number(item.quantity), item.id)}
                                disabled={loading || Number(item.quantity) === Number(item.stock)}
                            >
                                +
                            </button>

                        </div>

                    </div>
                ))}

            </div>

            <div className="cart-summary">

                <div className="summary-row">
                    <span>Subtotal</span>
                    <span>
                        ₦{
                            new Intl.NumberFormat("en-NG", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(Number(subtotal))
                        }
                    </span>
                </div>

                <div className="summary-row">
                    <span>Delivery fee</span>
                    <span>Free</span>
                </div>

                <div className="summary-row total-row">
                    <span>Total (Incl. VAT)</span>
                    <span>
                        ₦{
                            new Intl.NumberFormat("en-NG", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            }).format(Number(total))
                        }
                    </span>
                </div>

            </div>

            <button className="checkout-btn">
                <PaystackButton {...componentProps} />
            </button>

        </div>
    );
}