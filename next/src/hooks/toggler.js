import { useDispatch, useSelector } from "react-redux";

import { baseApi } from "../../app/api/config";
import { set_cart } from "../../redux/customer/cart";

export default function useToggler() {
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const refreshCart = async () => {
    const { data } = await baseApi.get("cart");

    if (!data.success) {
      console.log("Error:", data.message);
      return false;
    }

    dispatch(set_cart(data.data));
    return true;
  };

  const addToCart = async ({ item, qty = 1 }) => {
    try {
      const { data } = await baseApi.post("cart/add", {
        product_id: item.id,
        qty,
      });

      if (!data.success) {
        console.log("Error:", data.message);
        return false;
      }

      await refreshCart();
      return true;
    } catch (error) {
      console.error("Add to cart error:", error);
      return false;
    }
  };

  const rmFromCart = async (itemId) => {
    try {
      const cartItem = cart.find((c) => c.product_id === itemId);

      if (!cartItem) {
        console.log("Item is not in cart.");
        return false;
      }

      const { data } = await baseApi.delete("cart/delete", {
        data: { id: cartItem.id },
      });

      if (!data.success) {
        console.log("Error:", data.message);
        return false;
      }

      dispatch(set_cart(cart.filter((c) => c.id !== cartItem.id)));
      return true;
    } catch (error) {
      console.error("Remove from cart error:", error);
      return false;
    }
  };

  const isCarted = (itemId) => cart.some((c) => c.product_id === itemId);

  return { addToCart, rmFromCart, isCarted, refreshCart };
}
