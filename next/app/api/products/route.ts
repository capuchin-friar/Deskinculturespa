/**
 * 
 * Admin __ API route
 * Handle all operations related to Admin __
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import { ProductModel } from "../lib/models/product";


export const GET = async (request: NextRequest) => {

    try {

        // Get appointments offerings
        const response = await ProductModel._getAllProducttDoc();

        return NextResponse.json({
            success: true,
            data: response,
            message: "Products retrieved successfully!",
            
        }, {status: 201});


    } catch (error) {

        return NextResponse.json(
            {
                success: false,
                message: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
}