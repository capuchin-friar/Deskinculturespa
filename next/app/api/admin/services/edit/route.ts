/**
 * 
 * Admin Edit Services API Route
 * @module app/api/admin/services/edit/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ServiceModel } from "@/app/api/lib/models/service";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            name,
            description,
            price,
            duration_minutes,
            image_url,
            service_id
        } = body;

        if (!service_id) {
            return NextResponse.json(
                { message: "Service ID is required" },
                { status: 400 }
            );
        }

        // Validate all fields

        const serviceName =
            typeof name === "string" ? name.trim() : false;

        const serviceDescription =
            typeof description === "string" ? description.trim() : "";

        const serviceDuration =
            typeof duration_minutes === "number" ? duration_minutes : false;

        const servicePrice =
            typeof price === "number" ? price : "";


        const serviceImageUrl =
            typeof image_url === "string" ? image_url.trim() : false;


        if (!serviceName) {
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

        const decoded = jwt.decode(token);

        const admin_id = decoded.id;


        // Final validation 
        if (serviceName && serviceImageUrl && serviceDescription && serviceDuration && servicePrice) {
            // Create service
            const response = await ServiceModel.updateServiceDoc({
                name: serviceName,
                description: serviceDescription,
                price: servicePrice,
                duration_minutes: serviceDuration,
                image_url: (serviceImageUrl),
                service_id
            });

            return NextResponse.json({
                success: true,
                message: "Service updated successfully",
                service_id: response.id,
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Update failed validation!" },
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