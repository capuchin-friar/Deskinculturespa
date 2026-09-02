/**
 * 
 * Admin Signin API Route
 * 
 * @module app/api/admin/auth/signin/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../../lib/models/admin";
import { getJwtSecret } from "../../../lib/jwt";


export const POST = async (req: NextRequest) => {

    try {
        const secret = getJwtSecret(process.env.ADMIN_JWT_SECRET as string);
        if (!secret) {
            console.error("Signin: JWT_SECRET is not set");
            return NextResponse.json(
                { success: false, data: "Server configuration error (JWT)." },
                { status: 500 }
            );
        }

        const body = await req.json();
        const { email: rawEmail, password } = body;
        const email =
            typeof rawEmail === "string" ? rawEmail.trim() : "";
        if ((!email || typeof password !== "string")) {
            return NextResponse.json(
                { success: false, data: "invalid credentials" },
                { status: 401 }
            );
        }

        // Find admin by email
        const admins =
            email.length > 0
                ? await AdminModel.findAdminByEmailNormalized(email)
                : [];

        if (admins.length === 0) {
            return NextResponse.json(
                { success: false, data: "invalid credentials" },
                { status: 401 }
            );
        }

        const admin = admins[0];

        // Local authentication — bcrypt, or legacy plain-text (upgrade to hash on success)
        const stored = admin.password as string;
        let passwordMatch = false;
        if (stored && typeof stored === "string" && stored.startsWith("$2")) {
            passwordMatch = await bcrypt.compare(password, stored);
        }
        if (!passwordMatch) {
            return NextResponse.json(
                { success: false, data: "invalid credentials" },
                { status: 401 }
            );
        }

        const displayName = [admin.fname, admin.lname].filter(Boolean).join(" ").trim();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                ...(displayName ? { name: displayName } : {}),
            },
            secret,
            { expiresIn: "7d" }
        );

        // Remove password from response
        const { password: _, ...adminWithoutPassword } = admin;

        return NextResponse.json({
            success: true,
            message: "Login successful",
            cookie: token,
            admin: adminWithoutPassword,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}