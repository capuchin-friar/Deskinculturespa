/**
 * 
 * Admin Delete Services API Route
 * @module app/api/admin/services/add/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { ServiceModel } from "@/app/api/shared/models/service";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            service_id
        } = body;

        // Validate all fields
        if (typeof service_id !== "string" || !service_id.trim()) {
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

        const decoded = decodeAdminPayload(token);

        const admin_id = decoded.id;


        // Final validation 
        if (admin_id) {
            // Create service
            await ServiceModel.deleteServiceDoc({
                id: service_id.trim()
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
