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
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { DashboardModel } from "../../shared/models/dashboard";


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
