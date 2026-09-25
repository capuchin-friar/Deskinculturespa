import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../../lib/models/cart";
import { query } from "../../lib/database";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { product_id, qty } = body;

    if (!product_id) {
      return NextResponse.json({ success: false, data: "Product ID is required" }, { status: 400 });
    }

    if (!Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ success: false, data: "Quantity must be between 1 and 99" }, { status: 400 });
    }

    const product = await query(
      `SELECT id FROM products WHERE id = $1`,
      [product_id],
    );

    if (!product.rows[0]) {
      return NextResponse.json({ success: false, data: "Product not found" }, { status: 404 });
    }

    const cookie = req.cookies.get("user_token");
    if (!cookie?.value) {
      return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.decode(cookie.value);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const response = await CartModel.createCartDoc({
      product_id: String(product_id),
      qty,
      user_id: String(decoded.id),
    });

    return NextResponse.json({
      success: true,
      message: "Product added to cart successfully",
      cart_id: response.id,
    }, { status: 201 });
  } catch {
    return NextResponse.json({
      success: false,
      data: "Something went wrong. Please try again in a moment.",
    }, { status: 500 });
  }
};
