/**
 * 
 * Admin profile details API route
 * @module app/api/admin/user/edit/route
 */

import { isRecord, readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { UserModel } from "../../../shared/models/user";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
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

        const userLocation = isRecord(location) &&
            typeof location.state === "string" &&
            typeof location.city === "string"
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

        const decoded = decodeAdminPayload(token);

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
