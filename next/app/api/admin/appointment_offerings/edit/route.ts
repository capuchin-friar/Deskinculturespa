/**
 *
 * Admin Edit Appointments API Route
 * @module app/api/admin/appointments/edit/route
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

export const PATCH = async (req: NextRequest) => {
    try {
        const body = await readJsonObject(req);
        const {
            mode,
            duration_minutes,
            duration,
            price,
            appointment_id,
            thumbnail_url,
            slug,
            title,
            description,
        } = body;

        const appointmentId = appointment_id == null ? "" : String(appointment_id).trim();
        if (!appointmentId) {
            return NextResponse.json(
                { message: "Appointment ID is required" },
                { status: 400 }
            );
        }

        const appointmentMode =
            typeof mode === "string"
                ? CONSULTATION_MODES[mode.trim().toLowerCase()] || false
                : false;

        const appointmentDurationMins =
            typeof duration_minutes === "number"
                ? duration_minutes
                : typeof duration === "number"
                    ? duration
                    : Number(duration_minutes ?? duration);
        const parsedDuration = Number.isFinite(appointmentDurationMins)
            ? appointmentDurationMins
            : false;

        const parsedPrice = typeof price === "number" ? price : Number(price);
        const appointmentPrice = Number.isFinite(parsedPrice) ? parsedPrice : false;

        const appointmentThumbnail =
            typeof thumbnail_url === "string" ? thumbnail_url.trim() : false;

        const appointmentType = resolveAppointmentType(slug) || resolveAppointmentType(title);

        const appointmentSlug = appointmentType?.id || false;

        const appointmentDescription =
            typeof description === "string" ? description.trim() : "";

        if (!appointmentMode) {
            throw new Error("Appointment mode is required");
        }

        if (parsedDuration === false) {
            throw new Error("Appointment duration is required");
        }

        if (appointmentPrice === false) {
            throw new Error("Appointment price is required");
        }

        if (!appointmentThumbnail) {
            throw new Error("Appointment image is required");
        }

        if (!appointmentSlug) {
            throw new Error("Choose Skincare Consultation or Body Treatment Consultation.");
        }

        const getCookie = req.cookies.get("admin_token");
        if (!getCookie || !getCookie.value) {
            return NextResponse.json(
                { success: false, data: "Server error, cookie is missing!" },
                { status: 500 }
            );
        }
        const token = typeof getCookie.value === "string" ? getCookie.value : "";
        const decoded = decodeAdminPayload(token);
        const admin_id = decoded.id;

        if (admin_id && appointmentMode && parsedDuration !== false && appointmentPrice !== false && appointmentThumbnail && appointmentSlug) {
            const response = await AppointmentModel.updateAppointmentDoc({
                mode: appointmentMode,
                duration_minutes: parsedDuration,
                price: appointmentPrice,
                slug: appointmentSlug,
                thumbnail_url: appointmentThumbnail,
                description: appointmentDescription,
                appointment_id: appointmentId,
            });

            return NextResponse.json({
                success: true,
                message: "Appointment updated successfully",
                appointment_id: response.id,
            });
        }

        return NextResponse.json(
            { success: false, data: "Appointment failed validation!" },
            { status: 500 }
        );
    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
};
