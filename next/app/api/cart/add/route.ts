/**
 * Admin Add Blogs API Route
 *
 * @module app/api/admin/blogs/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../../lib/models/cart";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const {
            product_id,
            qty
        } = body;

        // Validate fields
        const cartItem =
            product_id ? product_id: false;

        const cartQty =
            qty ? qty : false;

       
        // Required field validation
        if (!cartItem) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Cart item is required",
                },
                { status: 400 }
            );
        }

        if (!cartQty) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Cart quantity is required",
                },
                { status: 400 }
            );
        }

        // Extract admin token
        const getCookie = req.cookies.get("user_token"); //Update to user token

        if (!getCookie?.value) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Authentication required",
                },
                { status: 401 }
            );
        }

        // Decode JWT
        const decoded = jwt.decode(getCookie.value);

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !("id" in decoded)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Invalid authentication token",
                },
                { status: 401 }
            );
        }

        const user_id = decoded.id;

        // Create blog
        const response = await CartModel.createCartDoc({
            product_id: cartItem,
            qty: cartQty,
            user_id,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Cart item created successfully",
                cart_id: response.id,
            },
            { status: 201 }
        );
    } catch (err) {
        return NextResponse.json(
            {
                success: false,
                data: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
};
