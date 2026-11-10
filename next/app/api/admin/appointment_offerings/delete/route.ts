/**
 * 
 * Admin Delete Appointments API Route
 * @module app/api/admin/appointments/add/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { AppointmentModel } from "@/app/api/shared/models/appointment";
import {
    catalogItemHasPaidPurchase,
    paidCatalogItemMessage,
} from "@/app/api/shared/models/catalogDeleteGuard";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const appointment_id = body.appointment_id ?? body.id;

        if (appointment_id == null || String(appointment_id).trim() === "") {
            return NextResponse.json(
                { message: "Appointment ID is required" },
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
            const id = String(appointment_id).trim();
            if (await catalogItemHasPaidPurchase("appointment", id)) {
                return NextResponse.json(
                    { success: false, message: paidCatalogItemMessage("appointment") },
                    { status: 409 }
                );
            }

            await AppointmentModel.deleteAppointmentDoc({
                id
            });

            return NextResponse.json({
                success: true,
                message: "Appointment deleted successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Appointment failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        return NextResponse.json(
            { success: false, data: err },
            { status: 500 }
        );
    }
}
