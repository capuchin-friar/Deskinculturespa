/**
 * 
 * Admin Edit Blogs API Route
 * @module app/api/admin/blogs/edit/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BlogModel } from "@/app/api/lib/models/blog";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            title,
            summary,
            content,
            image_urls,
            thumbnail_url,
            category,
            blog_id
        } = body;

        if (!blog_id) {
            return NextResponse.json(
                { message: "Blog ID is required" },
                { status: 400 }
            );
        }

        // Validate all fields
        const blogTitle =
            typeof title === "string" ? title.trim() : false;

        const blogSummary =
            typeof summary === "string" ? summary.trim() : false;

        const blogContent =
            typeof content === "string" ? content.trim() : false;

        const blogCategory =
            typeof category === "string" ? category.trim() : false;

        const blogImageUrls =
            Array.isArray(image_urls) && image_urls.length > 0 ? image_urls : false;

        const blogThumbnailUrl =
            typeof thumbnail_url === "string"
                ? thumbnail_url.trim()
                : false;

        // Required field validation
        if (!blogTitle) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Blog title is required",
                },
                { status: 400 }
            );
        }

        if (!blogContent) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Blog content is required",
                },
                { status: 400 }
            );
        }

        if (!blogCategory) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Blog category is required",
                },
                { status: 400 }
            );
        }

        if (!blogThumbnailUrl) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Blog thumbnail is required",
                },
                { status: 400 }
            );
        }

        if (!blogImageUrls) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Blog images is required",
                },
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


        // Edit blog
        const response = await BlogModel.updateBlogDoc({
            title: blogTitle,
            summary: blogSummary || "",
            content: blogContent,
            image_urls: blogImageUrls,
            thumbnail_url: blogThumbnailUrl || "",
            category: blogCategory,
            blog_id
        });

        return NextResponse.json(
            {
                success: true,
                message: "Blog created successfully",
                blog_id: response.id,
            },
            { status: 201 }
        );

    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}