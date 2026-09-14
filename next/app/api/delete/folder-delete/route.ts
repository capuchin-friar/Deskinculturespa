import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { getJwtSecret } from "../../lib/jwt";

export async function DELETE(request: NextRequest) {
    try {
        // ============================================
        // AUTHENTICATION
        // ============================================

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


        // ============================================
        // CLOUDINARY CONFIGURATION
        // ============================================

        const cloudName =
            process.env.CLOUDINARY_CLOUD_NAME;

        const apiKey =
            process.env.CLOUDINARY_API_KEY;

        const apiSecret =
            process.env.CLOUDINARY_API_SECRET;

        if (
            !cloudName ||
            !apiKey ||
            !apiSecret
        ) {
            return NextResponse.json(
                {
                    error:
                        "Cloudinary is not configured."
                },
                {
                    status: 503
                }
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });


        // ============================================
        // GET PRODUCT ID
        // ============================================

        const body = await request.json();

        const {
            product_id
        } = body;

        if (!product_id) {
            return NextResponse.json(
                {
                    error:
                        "Product ID is required."
                },
                {
                    status: 400
                }
            );
        }


        // ============================================
        // BUILD CLOUDINARY FOLDER
        // ============================================

        const folderPath =
            `Deskinculture/products/${product_id}`;


        // ============================================
        // DELETE ALL IMAGES IN FOLDER
        // ============================================

        await cloudinary.api.delete_resources_by_prefix(
            folderPath,
            {
                resource_type: "image",
                type: "upload"
            }
        );


        // ============================================
        // DELETE EMPTY FOLDER
        // ============================================

        await cloudinary.api.delete_folder(
            folderPath
        );


        // ============================================
        // SUCCESS
        // ============================================

        return NextResponse.json(
            {
                success: true,
                message:
                    "Product image folder deleted successfully.",
                folder: folderPath
            },
            {
                status: 200
            }
        );


    } catch (error) {

        // ============================================
        // JWT ERROR
        // ============================================

        if (
            error instanceof Error &&
            (
                error.name ===
                    "JsonWebTokenError" ||
                error.name ===
                    "TokenExpiredError"
            )
        ) {
            return NextResponse.json(
                {
                    error:
                        "Invalid or expired session."
                },
                {
                    status: 401
                }
            );
        }


        // ============================================
        // OTHER ERROR
        // ============================================

        console.error(
            "Cloudinary folder deletion error:",
            error
        );

        return NextResponse.json(
            {
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to delete Cloudinary folder."
            },
            {
                status: 500
            }
        );
    }
}