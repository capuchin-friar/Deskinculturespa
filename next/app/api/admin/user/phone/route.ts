/**
 * 
 * Admin profile phone API route
 * @module app/api/admin/user/phone/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import { decodeAdminPayload } from "@/app/api/shared/jwt";
import { UserModel } from "../../../shared/models/user";


export const PATCH = async (req: NextRequest) => {

    try {
        const body = await readJsonObject(req);
        const {
            phone
        } = body;

        // Validate all fields
        const userPhone =
            typeof phone === "string" && phone.length >= 10 ? phone : false;


        // Required field validation
        if (!userPhone) {
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

        const decoded = decodeAdminPayload(token);

        const admin_id = decoded.id;


        // Edit blog
        const response = await UserModel.updateUserPhoneById(
            admin_id,
            String(userPhone),
        );

        return NextResponse.json(
            {
                success: true,
                message: "Phone updated successfully",
                blog_id: response[0]?.id,
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
