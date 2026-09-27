/**
 * 
 * Admin Edit Blogs API Route
 * @module app/api/admin/blogs/edit/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { BlogModel } from "@/app/api/shared/models/blog";
import { isStringArray } from "@/app/api/shared/utils/request";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            title,
            summary,
            content,
            image_urls,
            thumbnail_url,
            category,
            blog_id
        } = body;

        if (typeof blog_id !== "string" || !blog_id.trim()) {
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

        const blogImageUrls = isStringArray(image_urls) && image_urls.length > 0 ? image_urls : false;

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

        const decoded = decodeAdminPayload(token);

        const admin_id = decoded?.id;


        // Edit blog
        const response = await BlogModel.updateBlogDoc({
            title: blogTitle,
            summary: blogSummary || null,
            content: blogContent,
            image_urls: blogImageUrls,
            thumbnail_url: blogThumbnailUrl || "",
            category: blogCategory,
            blog_id: blog_id.trim()
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
