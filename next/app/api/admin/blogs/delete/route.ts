/**
 * 
 * Admin Delete Blogs API Route
 * @module app/api/admin/blogs/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BlogModel } from "@/app/api/lib/models/blog";


export const DELETE = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            blog_id
        } = body;

        // Validate all fields
        if (!blog_id) {
            return NextResponse.json(
                { message: "Blog ID is required" },
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
        if (blog_id && admin_id) {
            // Create blog
            await BlogModel.deleteBlogDoc({
                id: blog_id
            });

            return NextResponse.json({
                success: true,
                message: "Blog deleted successfully",
            });
        } else {
            return NextResponse.json(
                { success: false, data: "Blog failed validation!" },
                { status: 500 }
            );
        }



    } catch (err) {
        return NextResponse.json(
            { success: false, data: err },
            { status: 500 }
        );
    }
}