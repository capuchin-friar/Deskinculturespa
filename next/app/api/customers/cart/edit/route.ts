import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { CartModel } from "../../../shared/models/cart";

export const PATCH = async (req: NextRequest) => {
  try {
    const body = await readJsonObject(req);
    const { id, qty } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ success: false, message: "Cart ID is required" }, { status: 400 });
    }

    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return NextResponse.json({ success: false, data: "Quantity must be between 1 and 99" }, { status: 400 });
    }

    const cookie = req.cookies.get("user_token");
    if (!cookie?.value) {
      return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
    }

    const user_id = decodeUserId(cookie.value);
    if (!user_id) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const response = await CartModel.updateCartDoc({
      cart_id: id.trim(),
      qty,
      user_id,
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
