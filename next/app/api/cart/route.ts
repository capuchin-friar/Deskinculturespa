/**
 * 
 * Admin __ API route
 * Handle all operations related to Admin __
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { CartModel } from "../lib/models/cart";


export const GET = async (request: NextRequest) => {

    try {
        const getCookie = request.cookies.get("user_token");

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

        // Get appointments offerings
        const response = await CartModel.getAllCartDoc({ id: user_id});

        return NextResponse.json({
            success: true,
            data: response,
            message: "Carts retrieved successfully!",
            
        }, {status: 201});


    } catch (error) {
        console.log("error: ", error)
        return NextResponse.json(
            {
                success: false,
                data: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
}