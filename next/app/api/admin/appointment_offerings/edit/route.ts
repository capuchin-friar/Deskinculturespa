/**
 * 
 * Admin Edit Appointments API Route
 * @module app/api/admin/appointments/edit/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { AppointmentModel } from "@/app/api/lib/models/appointment";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            mode,
            duration_minutes,
            price,
            appointment_id
        } = body;

        if (!appointment_id) {
            return NextResponse.json(
                { message: "Appointment ID is required" },
                { status: 400 }
            );
        }

        // Validate all fields
        const appointmentMode =
            typeof mode === "string" ? mode.trim() : false;

        const appointmentDurationMins =
            typeof duration_minutes === "number" ? duration_minutes : false;

        const appointmentPrice =
            typeof price === "number" ? price : false;


        if (!appointmentMode) {
            throw new Error("Appointment mode is required");
        }

        if (!appointmentDurationMins) {
            throw new Error("Appointment duration is required");
        }

        if (!appointmentPrice) {
            throw new Error("Appointment price is required");
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
        if (appointmentMode && appointmentDurationMins && appointmentPrice) {
            // Create appointment
            const response = await AppointmentModel.updateAppointmentDoc({
                mode: appointmentMode,
                duration_minutes: appointmentDurationMins,
                price: appointmentPrice,
                appointment_id: appointment_id
            });

            return NextResponse.json({
                success: true,
                message: "Appointment updated successfully",
                appointment_id: response.id,
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Appointment failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}