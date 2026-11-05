import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";

import { baseApi } from "../../app/api/shared/config";
import { set_cart } from "../../redux/customer/cart";

export default function useToggler() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { cart } = useSelector((state) => state.cart);

  const refreshCart = async () => {
    try {
      const { data } = await baseApi.get("customers/cart");

      if (!data.success) {
        console.log("Error:", data.message);
        return false;
      }

      dispatch(set_cart(Array.isArray(data.data) ? data.data : []));
      return true;
    } catch (error) {
      console.error("Refresh cart error:", error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      const { data } = await baseApi.delete("customers/cart");
      if (!data.success) {
        console.log("Error:", data.message);
        dispatch(set_cart([]));
        return false;
      }
      dispatch(set_cart([]));
      return true;
    } catch (error) {
      console.error("Clear cart error:", error);
      dispatch(set_cart([]));
      return false;
    }
  };

  const addToCart = async ({ item, qty = 1 }) => {
    try {
      const { data } = await baseApi.post("customers/cart/add", {
        product_id: (item.id),
        qty,
      });

      if (!data.success) {
        console.log("Error:", data.message);
        return false;
      }

      await refreshCart();
      return true;
    } catch (error) {
      if (error.response?.status === 401) {
        const destination = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?next=${encodeURIComponent(destination)}`);
        return false;
      }

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

      const { data } = await baseApi.delete("customers/cart/delete", {
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

  return { addToCart, rmFromCart, isCarted, refreshCart, clearCart };
}
