/**
 * 
 * Admin Add Appointments API Route
 * @module app/api/admin/appointments/add/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { AppointmentModel } from "@/app/api/shared/models/appointment";
import { resolveAppointmentType } from "@/src/utils/appointmentTypes";

const CONSULTATION_MODES: Record<string, "physical" | "video" | "audio" | "chat"> = {
    physical: "physical",
    "in-person": "physical",
    inperson: "physical",
    online: "video",
    video: "video",
    phone: "audio",
    audio: "audio",
    chat: "chat",
};

export const POST = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            mode,
            duration_minutes,
            duration,
            price,
            thumbnail_url,
            slug,
            title,
            description,
        } = body;

        // Validate all fields

        const appointmentMode =
            typeof mode === "string"
                ? CONSULTATION_MODES[mode.trim().toLowerCase()] || false
                : false;

        const appointmentDurationMins =
            typeof duration_minutes === "number"
                ? duration_minutes
                : typeof duration === "number"
                    ? duration
                    : false;

        const appointmentPrice =
            typeof price === "number" ? price : false;

        const appointmentThumbnail =
            typeof thumbnail_url === "string" ? thumbnail_url.trim() : false;

        const appointmentType = resolveAppointmentType(slug) || resolveAppointmentType(title);

        const appointmentSlug = appointmentType?.id || false;

        const appointmentDescription =
            typeof description === "string" ? description.trim() : "";


        if (!appointmentMode) {
            throw new Error("Appointment mode is required");
        }

        if (!appointmentDurationMins) {
            throw new Error("Appointment duration is required");
        }

        if (!appointmentPrice) {
            throw new Error("Appointment price is required");
        }

        if (!appointmentThumbnail) {
            throw new Error("Appointment image is required");
        }

        if (!appointmentSlug) {
            throw new Error("Choose Skincare Consultation or Body Treatment Consultation.");
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
        if (appointmentMode && appointmentDurationMins && appointmentPrice && appointmentThumbnail && appointmentSlug) {
            // Create appointment
            const response = await AppointmentModel.createAppointmentDoc({
                mode: appointmentMode,
                duration_minutes: appointmentDurationMins,
                price: appointmentPrice,
                slug: appointmentSlug,
                thumbnail_url: appointmentThumbnail,
                description: appointmentDescription,
                admin_id
            });

            return NextResponse.json({
                success: true,
                message: "Appointment created successfully",
                appointment_id: response.id,
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Appointment failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        console.log("err: ", err)
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}
