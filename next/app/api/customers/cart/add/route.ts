import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { CartModel } from "../../../shared/models/cart";
import { query } from "../../../shared/database";

export const POST = async (req: NextRequest) => {
  try {
    const body = await readJsonObject(req);
    const { product_id, qty } = body;

    if (typeof product_id !== "string" || !product_id.trim()) {
      return NextResponse.json({ success: false, data: "Product ID is required" }, { status: 400 });
    }

    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
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

    const user_id = decodeUserId(cookie.value);
    if (!user_id) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const response = await CartModel.createCartDoc({
      product_id: product_id.trim(),
      qty,
      user_id,
    });

    return NextResponse.json({
      success: true,
      message: "Product added to cart successfully",
      cart_id: response.id,
    }, { status: 201 });
  } catch(err) {
    return NextResponse.json({
      success: false,
      data: "Something went wrong. Please try again in a moment." + err,
    }, { status: 500 });
  }
};
