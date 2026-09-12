/**
 * 
 * Admin Edit Blogs API Route
 * @module app/api/user/blogs/edit/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BlogModel } from "@/app/api/lib/models/blog";
import { CartModel } from "../../lib/models/cart";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            id, 
            qty
        } = body;

        if (!id) {
            return NextResponse.json(
                { message: "Cart ID is required" },
                { status: 400 }
            );
        }

        // Validate all fields
        const cartId =
            id ? id : false;

        const cartQty =
            qty ? qty : false;

       
        // Required field validation
        if (!cartId) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Cart ID is required",
                },
                { status: 400 }
            );
        }

        if (!cartQty) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Cart Quantity is required",
                },
                { status: 400 }
            );
        }

        // Extract the user id from the JWT
        const getCookie = req.cookies.get("user_token");
        if (!getCookie || !getCookie.value) {
            return NextResponse.json(
                { success: false, data: "Server error, cookie is missing!" },
                { status: 500 }
            );
        }
        const token = typeof (getCookie.value) === "string" ? getCookie.value : "";

        const decoded = jwt.decode(token);

        const user_id = decoded.id;


        // Edit blog
        const response = await CartModel.updateCartDoc({
            cart_id: cartId,
            qty: cartQty
        });

        return NextResponse.json(
            {
                success: true,
                message: "Cart updated successfully",
                cart_id: response.id,
            },
            { status: 201 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}