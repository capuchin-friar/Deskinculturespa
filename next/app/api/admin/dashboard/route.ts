/**
 * 
 * Admin dashboard API route
 * Handle all operations related to Admin Dashboard
 * 
 * - Business Overview (Customer, Orders, Revenue, Views)
 * - Order Breakdown (Products, Services, Appointment)
 * - Catalogue / Operations (Product listed, Services offered, Upcoming events, Pending orders)
 * 
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { DashboardModel } from "../../lib/models/dashboard";


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

        // Get dashboard metrics
        const response = await DashboardModel.getDashboardDoc();

        return NextResponse.json(
            {
                success: true,
                message: "Dashboard metrics returned successfully",
                data: response,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Add blog error:", error);

        return NextResponse.json(
            {
                success: false,
                data: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
}