/**
 * 
 * Admin __ API route
 * Handle all operations related to Admin __
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { ProductModel } from "../../shared/models/product";


export const GET = async (request: NextRequest) => {

    try {
        const admin_id = await getRequestAdminId(request);

        if (!admin_id) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Authentication required",
                },
                { status: 401 }
            );
        }

        // Get appointments offerings
        const response = await ProductModel.getAllProducttDoc({ id: admin_id});

        return NextResponse.json({
            success: true,
            data: response,
            message: "Products retrieved successfully!",
            
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
