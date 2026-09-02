/**
 * 
 * Admin Delete Services API Route
 * @module app/api/admin/services/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ServiceModel } from "@/app/api/lib/models/service";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            service_id
        } = body;

        // Validate all fields
        if (!service_id) {
            return NextResponse.json(
                { message: "Service ID is required" },
                { status: 400 }
            );
        }

        // Extract the admin id from the JWT
        const getCookie = req.cookies.get("admin_token");
        if (!getCookie || !getCookie.value) {
            return NextResponse.json(
                { success: false, data: "Server error, cookie is missing!" },
                { status: 500 }
            );
        }
        const token = typeof (getCookie.value) === "string" ? getCookie.value : "";

        const decoded = jwt.decode(token);

        const admin_id = decoded.id;


        // Final validation 
        if (service_id && admin_id) {
            // Create service
            await ServiceModel.deleteServiceDoc({
                id: service_id
            });

            return NextResponse.json({
                success: true,
                message: "Service deleted successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Service failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        console.log("err: ", err)
        return NextResponse.json(
            { success: false, data: err },
            { status: 500 }
        );
    }
}