/**
 * 
 * Admin __ API route
 * Handle all operations related to Admin __
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AppointmentModel } from "../../lib/models/appointment";


export const GET = async (request: NextRequest) => {

    try {
        const getCookie = request.cookies.get("admin_token");

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

        const admin_id = decoded.id;

        // Get appointments offerings
        const response = await AppointmentModel.getAllAppointmentDoc({ id: admin_id});

        return NextResponse.json({
            success: true,
            data: response,
            message: "Appointment offering retrieved successfully!",
            
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