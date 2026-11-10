/**
 * 
 * Admin Delete Services API Route
 * @module app/api/admin/services/add/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { ServiceModel } from "@/app/api/shared/models/service";
import {
    catalogItemHasPaidPurchase,
    paidCatalogItemMessage,
} from "@/app/api/shared/models/catalogDeleteGuard";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const service_id = body.service_id ?? body.id;

        if (service_id == null || String(service_id).trim() === "") {
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
            const id = String(service_id).trim();
            if (await catalogItemHasPaidPurchase("service", id)) {
                return NextResponse.json(
                    { success: false, message: paidCatalogItemMessage("service") },
                    { status: 409 }
                );
            }

            await ServiceModel.deleteServiceDoc({
                id
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
