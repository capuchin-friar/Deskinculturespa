/**
 * Admin Add Blogs API Route
 *
 * @module app/api/admin/blogs/add/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { BlogModel } from "@/app/api/lib/models/blog";

export const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();

        const {
            title,
            summary,
            content,
            image_urls,
            thumbnail_url,
            category,
        } = body;

        // Validate fields
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

        // Extract admin token
        const getCookie = req.cookies.get("admin_token");

        if (!getCookie?.value) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Authentication required",
                },
                { status: 401 }
            );
        }

        // Decode JWT
        const decoded = jwt.decode(getCookie.value);

        if (
            !decoded ||
            typeof decoded !== "object" ||
            !("id" in decoded)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    data: "Invalid authentication token",
                },
                { status: 401 }
            );
        }

        const admin_id = decoded.id;

        // Create blog
        const response = await BlogModel.createBlogDoc({
            title: blogTitle,
            summary: blogSummary || null,
            content: blogContent,
            image_urls: blogImageUrls,
            thumbnail_url: blogThumbnailUrl || null,
            category: blogCategory,
            admin_id,
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
        console.error("Add blog error:", err);

        return NextResponse.json(
            {
                success: false,
                data: "Something went wrong. Please try again in a moment.",
            },
            { status: 500 }
        );
    }
};
