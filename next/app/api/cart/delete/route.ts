import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../../lib/models/cart";

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Cart ID is required" }, { status: 400 });
    }

    const cookie = req.cookies.get("user_token");
    if (!cookie?.value) {
      return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
    }

    const decoded = jwt.decode(cookie.value);
    if (!decoded || typeof decoded !== "object" || !("id" in decoded)) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const deleted = await CartModel.deleteCartDoc({
      id: String(id),
      user_id: String(decoded.id),
    });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    return NextResponse.json({ success: false, data: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
