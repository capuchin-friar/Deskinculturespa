/**
 * 
 * User Signin API Route
 * 
 * @module app/api/user/auth/signin/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";
import { getJwtSecret } from "../../lib/jwt";


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

        // Find user by email
        const users =
            email.length > 0
                ? await UserModel.findUserByEmailNormalized(email)
                : [];

        if (users.length === 0) {
            return NextResponse.json(
                { success: false, data: "invalid credentials" },
                { status: 401 }
            );
        }

        const user = users[0];

        // Local authentication — bcrypt, or legacy plain-text (upgrade to hash on success)
        const stored = user.password as string;
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

        const displayName = [user.fname, user.lname].filter(Boolean).join(" ").trim();

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                ...(displayName ? { name: displayName } : {}),
            },
            secret,
            { expiresIn: "7d" }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "Login successful",
            cookie: token,
            user: userWithoutPassword,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, data: "Something went wrong. Please try again in a moment." },
            { status: 500 }
        );
    }
}