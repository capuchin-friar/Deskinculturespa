import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { CartModel } from "../../../shared/models/cart";

export const DELETE = async (req: NextRequest) => {
  try {
    const body = await readJsonObject(req);
    const { id } = body;

    if (typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ success: false, message: "Cart ID is required" }, { status: 400 });
    }

    const cookie = req.cookies.get("user_token");
    if (!cookie?.value) {
      return NextResponse.json({ success: false, data: "Authentication required" }, { status: 401 });
    }

    const user_id = decodeUserId(cookie.value);
    if (!user_id) {
      return NextResponse.json({ success: false, data: "Invalid authentication token" }, { status: 401 });
    }

    const deleted = await CartModel.deleteCartDoc({
      id: id.trim(),
      user_id,
    });

    if (!deleted) {
      return NextResponse.json({ success: false, message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Cart item deleted successfully" });
  } catch (err) {
    return NextResponse.json({ success: false, data: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
};
