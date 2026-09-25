import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../../lib/models/cart";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id, qty } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Cart ID is required" }, { status: 400 });
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ success: false, data: "Quantity must be between 1 and 99" }, { status: 400 });
    }

    const cookie = req.cookies.get("user_token");
    if (!cookie?.value) {
      return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.decode(cookie.value);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const response = await CartModel.updateCartDoc({
      cart_id: String(id),
      qty,
      user_id: String(decoded.id),
    });

    if (!response) {
      return NextResponse.json({ success: false, message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Cart updated successfully",
      cart_id: response.id,
    }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ success: false, data: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
