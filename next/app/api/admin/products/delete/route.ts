/**
 * 
 * Admin Delete Products API Route
 * @module app/api/admin/products/add/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { ProductModel } from "@/app/api/shared/models/product";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            product_id
        } = body;

        // Validate all fields
        if (typeof product_id !== "string" || !product_id.trim()) {
            return NextResponse.json(
                { message: "Product ID is required" },
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
            // Create product
            await ProductModel.deleteProductDoc({
                id: product_id.trim()
            });

            return NextResponse.json({
                success: true,
                message: "Product deleted successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Product failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        console.log("err: ", err)
        return NextResponse.json(
            { success: false, data: err },
            { status: 500 }
        );
    }
}
