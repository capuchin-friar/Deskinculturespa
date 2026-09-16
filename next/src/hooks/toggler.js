import { useDispatch, useSelector } from "react-redux";

import { baseApi } from "../../app/api/config";

import { set_cart } from "../../redux/customer/cart";


export default function useToggler() {

    const dispatch = useDispatch();

    const { cart } = useSelector(
        (state) => state.cart
    );


    const addToCart = async ({ item, qty }) => {

        try {

            const { data } = await baseApi.post(
                "cart/add",
                {
                    product_id: item.id,
                    qty: qty
                }
            );


            if (!data.success) {

                console.log(
                    "Error:",
                    data.message
                );

                return;
            }


            // Get updated cart

            const { data: cartResponse } =
                await baseApi.get("cart");


            if (!cartResponse.success) {

                console.log(
                    "Error:",
                    cartResponse.message
                );

                return;
            }


            dispatch(
                set_cart(
                    cartResponse.data
                )
            );

        } catch (error) {

            console.error(
                "Add to cart error:",
                error
            );

        }

    };


    const rmFromCart = async (itemId) => {

        try {

            const cartItem = cart.find(
                (c) =>
                    c.product_id === itemId
            );


            if (!cartItem) {

                console.log(
                    "Product is not in cart."
                );

                return;
            }


            const { data } =
                await baseApi.delete(
                    "cart/delete",
                    {
                        data: {
                            id: cartItem.id
                        }
                    }
                );


            if (!data.success) {

                console.log(
                    "Error:",
                    data.message
                );

                return;
            }


            dispatch(
                set_cart(
                    cart.filter(
                        (c) =>
                            c.id !== cartItem.id
                    )
                )
            );

        } catch (error) {

            console.error(
                "Remove from cart error:",
                error
            );

        }

    };


    const isCarted = (itemId) => {

        return cart.some(
            (c) =>
                c.product_id === itemId
        );

    };


    return {
        addToCart,
        rmFromCart,
        isCarted
    };

}