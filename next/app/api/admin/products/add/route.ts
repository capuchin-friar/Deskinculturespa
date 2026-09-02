/**
 * 
 * Admin Add Products API Route
 * @module app/api/admin/products/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { ProductModel } from "@/app/api/lib/models/product";


export const POST = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            name,
            description,
            category,
            subcategory,
            brand,
            images,
            thumbnail_url,
            specifications
        } = body;

        // Validate all fields

        const productName =
            typeof name === "string" ? name.trim() : false;

        const productDescription =
            typeof description === "string" ? description.trim() : "";

        const productCategory =
            typeof category === "string" ? category.trim() : false;

        const productSubcategory =
            typeof subcategory === "string" ? subcategory.trim() : "";


        const thumbnailUrl =
            typeof thumbnail_url === "string" ? thumbnail_url.trim() : false;

        const productImages = Array.isArray(images) ? images : false /** Suppose to be [] but used boolean for faster validation */;

        const productBrand =
            typeof brand === "string" ? brand.trim() : "";

        const productSpecifications =
            specifications &&
                typeof specifications === "object" &&
                !Array.isArray(specifications)
                ? specifications
                : {};

        if (!productName) {
            throw new Error("Product name is required");
        }

        if (!thumbnailUrl) {
            throw new Error("Product thumbnail is required");
        }

        if (!productImages) {
            throw new Error("Product images is required");
        }

        if (!productCategory) {
            throw new Error("Product category is required");
        }

        // Extract the admin id from the JWT
        const getCookie = req.cookies.get("admin_token");
        if(!getCookie || !getCookie.value){
            return NextResponse.json(
                { success: false, data: "Server error, cookie is missing!" },
                { status: 500 }
            );
        }
        const token = typeof(getCookie.value) === "string" ? getCookie.value :  "";

        const decoded = jwt.decode(token);  

        const admin_id = decoded.id;


        // Final validation 
        if (productName && thumbnailUrl && productImages && productCategory) {
            // Create product
            const response = await ProductModel.createProductDoc({
                name: productName,
                description: productDescription,
                category: productCategory,
                subcategory: productSubcategory,
                brand: productBrand,
                images: (productImages),
                thumbnail_url: thumbnailUrl,
                specifications: productSpecifications,
                admin_id
            });

            return NextResponse.json({
                success: true,
                message: "Product created successfully",
                product_id: response.id,
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
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}