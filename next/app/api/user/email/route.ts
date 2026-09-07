/**
 * 
 * Admin Edit Blogs API Route
 * @module app/api/admin/blogs/edit/route
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await req.json();
        const {
            email
        } = body;

        // Validate all fields
        const userEmail =
            typeof email === "string" ? email : false;


        // Required field validation
        if (!userEmail) {
            return NextResponse.json(
                {
                    success: false,
                    data: "User phone is required.",
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
        const response = await UserModel.updateUserEmailById(
            admin_id,
            (userEmail),
        );

        return NextResponse.json(
            {
                success: true,
                message: "Phone updated successfully",
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