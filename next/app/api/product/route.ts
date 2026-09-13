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
       
        const { searchParams } = new URL(request.url);

        const id = searchParams.get("id");
        console.log("id: ", id);

        if (
            !id
        ) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Product id is required",
                },
                { status: 401 }
            );
        }

        // Get appointments offerings
        const response = await ProductModel.getProductDoc({ id });

        return NextResponse.json({
            success: true,
            data: response[0],
            message: "Product retrieved successfully!",
            
        }, {status: 201});


    } catch (error) {

        return NextResponse.json(
            {
                success: false,
                data: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
}