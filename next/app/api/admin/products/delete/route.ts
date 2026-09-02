/**
 * 
 * Admin Delete Products API Route
 * @module app/api/admin/products/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ProductModel } from "@/app/api/lib/models/product";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            product_id
        } = body;

        // Validate all fields
        if (!product_id) {
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

        const decoded = jwt.decode(token);

        const admin_id = decoded.id;


        // Final validation 
        if (product_id && admin_id) {
            // Create product
            await ProductModel.deleteProductDoc({
                id: product_id
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