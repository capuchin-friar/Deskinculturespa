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
            fname,
            lname,
            gender,
            location,
        } = body;

        // Validate all fields
        const userFname =
            typeof fname === "string" ? fname.trim() : false;

        const userLname =
            typeof lname === "string" ? lname.trim() : false;

        const userGender =
            typeof gender === "string" ? gender.trim() : false;

        const userLocation =
            location &&
                typeof location === "object" &&
                location.state &&
                location.city
                ? location
                : false;




        // Required field validation
        if (!userFname || !userLname || !userGender || !userLocation) {
            return NextResponse.json(
                {
                    success: false,
                    data: "User details must be complete.",
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
        const response = await UserModel.updateProfile({
            fname: userFname,
            lname: userLname,
            gender: userGender,
            location: JSON.stringify(userLocation),
            id: admin_id
        });

        return NextResponse.json(
            {
                success: true,
                message: "User details updated successfully",
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