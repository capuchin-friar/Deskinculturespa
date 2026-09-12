/**
 * 
 * Admin Delete Carts API Route
 * @module app/api/user/blogs/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../../lib/models/cart";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            id
        } = body;

        // Validate all fields
        if (!id) {
            return NextResponse.json(
                { message: "Cart ID is required" },
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


        // Final validation 
        if (id && user_id) {
            // Create blog
            await CartModel.deleteCartDoc({
                id: id
            });

            return NextResponse.json({
                success: true,
                message: "Cart item deleted successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Cart failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        console.log(err)
        return NextResponse.json(
            { success: false, data: err },
            { status: 500 }
        );
    }
}