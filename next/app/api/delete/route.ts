// app/api/upload/route.js

import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { getJwtSecret } from "../../lib/jwt";

export async function DELETE(request) {
    try {
        // Extract the admin id from the JWT
        const getCookie = request.cookies.get("admin_token");
        if (!getCookie || !getCookie.value) {
            return NextResponse.json(
                { success: false, data: "Server error, cookie is missing!" },
                { status: 500 }
            );
        }
        const token = typeof (getCookie.value) === "string" ? getCookie.value : "";

        const decoded = jwt.decode(token);

        const admin_id = decoded.id;

        const {
            cloudName,
            apiKey,
            apiSecret
        } = {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        };

        if (!cloudName || !apiKey || !apiSecret) {
            return NextResponse.json(
                { error: "Cloudinary is not configured." },
                { status: 503 }
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        const body = await request.json();

        const { publicId } = body;

        if (!publicId) {
            return NextResponse.json(
                { error: "publicId is required." },
                { status: 400 }
            );
        }

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result !== "ok") {
            return NextResponse.json(
                {
                    error: "Failed to delete image.",
                    result: result.result
                },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Image deleted successfully.",
            publicId
        });

    } catch (err) {
        if (
            err instanceof Error &&
            (
                err.name === "JsonWebTokenError" ||
                err.name === "TokenExpiredError"
            )
        ) {
            return NextResponse.json(
                { error: "Invalid or expired session." },
                { status: 401 }
            );
        }

        console.error("Image deletion error:", err);

        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Image deletion failed."
            },
            { status: 500 }
        );
    }
}