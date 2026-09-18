/**
 * 
 * Admin __ API route
 * Handle all operations related to Admin __
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import { ServiceModel } from "../lib/models/service";


export const GET = async (request: NextRequest) => {

    try {

        // Get appointments offerings
        const response = await ServiceModel._getAllServiceDoc();

        return NextResponse.json({
            success: true,
            data: response,
            message: "Services retrieved successfully!",
            
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