/**
 *
 * Admin Edit Services API Route
 * @module app/api/admin/services/edit/route
 */

import { isJsonRecord, readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { ServiceModel } from "@/app/api/shared/models/service";

export const PATCH = async (req: NextRequest) => {
    try {
        const body = await readJsonObject(req);
        const {
            specifications,
            description,
            price,
            duration_minutes,
            duration,
            image_url,
            service,
            sub_service,
            service_id,
        } = body;

        const serviceId = service_id == null ? "" : String(service_id).trim();
        if (!serviceId) {
            return NextResponse.json(
                { message: "Service ID is required" },
                { status: 400 }
            );
        }

        const serviceDescription =
            typeof description === "string" ? description.trim() : "";

        const serviceDuration =
            typeof duration_minutes === "number"
                ? duration_minutes
                : typeof duration === "number"
                    ? duration
                    : Number(duration_minutes ?? duration);

        const parsedDuration = Number.isFinite(serviceDuration) ? serviceDuration : false;

        const parsedPriceValue = typeof price === "number" ? price : Number(price);
        const servicePrice = Number.isFinite(parsedPriceValue) ? parsedPriceValue : false;

        const serviceSpecifications = isJsonRecord(specifications) ? specifications : {};

        const serviceService =
            typeof service === "string" ? service.trim() : false;

        const serviceSubService =
            typeof sub_service === "string" ? sub_service.trim() : "";

        const serviceImageUrl =
            typeof image_url === "string" ? image_url.trim() : false;

        if (!serviceImageUrl) {
            throw new Error("Service thumbnail is required");
        }

        if (!serviceDescription) {
            throw new Error("Service description is required");
        }

        if (servicePrice === false) {
            throw new Error("Service price is required");
        }

        if (parsedDuration === false) {
            throw new Error("Service duration is required");
        }

        if (!serviceService) {
            throw new Error("Service category is required");
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

        if (admin_id && serviceImageUrl && serviceDescription && parsedDuration !== false && servicePrice !== false && serviceService) {
            const response = await ServiceModel.updateServiceDoc({
                description: serviceDescription,
                price: servicePrice,
                duration_minutes: parsedDuration,
                image_url: serviceImageUrl,
                service: serviceService,
                sub_service: serviceSubService,
                specifications: serviceSpecifications,
                service_id: serviceId,
            });

            return NextResponse.json({
                success: true,
                message: "Service updated successfully",
                service_id: response.id,
            });
        }

        return NextResponse.json(
            { success: false, data: "Update failed validation!" },
            { status: 500 }
        );
    } catch (err) {
        console.log("err: ", err);
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
};
