/**
 * 
 * Admin Add Service API Route
 * @module app/api/admin/services/add/route
 */

import { isJsonRecord, readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { ServiceModel } from "@/app/api/shared/models/service";


export const POST = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            specifications,
            description,
            price,
            duration_minutes,
            image_url,
            service,
            sub_service
        } = body;

        // Validate all fields

        // const serviceName =
        //     typeof name === "string" ? name.trim() : false;

        const serviceDescription =
            typeof description === "string" ? description.trim() : "";

        const serviceDuration =
            typeof duration_minutes === "number" ? duration_minutes : false;

        const servicePrice =
            typeof price === "number" ? price : false;

        const serviceSpecifications = isJsonRecord(specifications) ? specifications : {};

        const serviceService =
            typeof service === "string" ? service.trim() : false;

        const serviceSubService =
            typeof sub_service === "string" ? sub_service.trim() : false;

        const serviceImageUrl =
            typeof image_url === "string" ? image_url.trim() : false;


        // if (!serviceName) {
        //     throw new Error("Service name is required");
        // }

        if (!serviceService) {
            throw new Error("Service name is required");
        }

        if (!serviceSubService) {
            throw new Error("Service name is required");
        }

        if (!serviceImageUrl) {
            throw new Error("Service thumbnail is required");
        }

        if (!serviceDescription) {
            throw new Error("Service description is required");
        }

        if (!servicePrice) {
            throw new Error("Service price is required");
        }

        if (!serviceDuration) {
            throw new Error("Service duration is required");
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
        if (serviceService && serviceSubService && serviceDescription && serviceDuration && servicePrice && serviceImageUrl) {
            // Create product
            const response = await ServiceModel.createServiceDoc({
                specifications: serviceSpecifications,
                description: serviceDescription,
                price: servicePrice,
                duration_minutes: serviceDuration,
                service: (serviceService),
                sub_service: serviceSubService,
                image_url: serviceImageUrl,
                admin_id
            });

            return NextResponse.json({
                success: true,
                message: "Service created successfully",
                service_id: response.id,
            });
        } else {
            return NextResponse.json(
                { success: false, message: "Service failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        console.log("err: ", err)
        return NextResponse.json(
            { success: false, message: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}
