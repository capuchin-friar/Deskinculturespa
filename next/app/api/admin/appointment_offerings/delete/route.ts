/**
 * 
 * Admin Delete Appointments API Route
 * @module app/api/admin/appointments/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AppointmentModel } from "@/app/api/lib/models/appointment";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            appointment_id
        } = body;

        // Validate all fields
        if (!appointment_id) {
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

        const decoded = jwt.decode(token);

        const admin_id = decoded.id;


        // Final validation 
        if (appointment_id && admin_id) {
            // Create appointment
            await AppointmentModel.deleteAppointmentDoc({
                id: appointment_id
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