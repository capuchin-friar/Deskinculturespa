/**
 * 
 * Customer cart API route
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { CartModel } from "../../shared/models/cart";


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
        const user_id = decodeUserId(getCookie.value);
        if (!user_id) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Invalid authentication token",
                },
                { status: 401 }
            );
        }

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
                data: error,
            },
            { status: 500 }
        );
    }
}
