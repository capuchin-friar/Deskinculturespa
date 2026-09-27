/**
 * User Signup API Route
 * 
 * Handles user registration for both local and OAuth providers.
 * 
 * @module app/api/shared/auth/signup/route
 */

import { readJsonObject } from "@/app/api/shared/utils/request";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../models/user";
import { getJwtSecret } from "../../jwt";
import type { UserRole } from "../../types/user";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
    try {
        const body = await readJsonObject(request);
        const {
            fname,
            lname,
            email,
            phone,
            password,
            role,
        } = body;

        if (
            typeof fname !== "string" || !fname.trim() ||
            typeof lname !== "string" || !lname.trim() ||
            typeof email !== "string" || !email.trim() ||
            typeof password !== "string" || password.length === 0 ||
            (role !== "customer" && role !== "user") ||
            (phone !== undefined && phone !== null && typeof phone !== "string")
        ) {
            return NextResponse.json(
                { success: false, data: { mssg: "Valid name, email, password, role, and phone fields are required" } },
                { status: 400 },
            );
        }

        const secretValue = process.env.ADMIN_JWT_SECRET;
        if (!secretValue?.trim()) {
            return NextResponse.json(
                { success: false, data: { mssg: "Server configuration error (JWT)" } },
                { status: 500 },
            );
        }

        const normalizedEmail = email.trim();
        const userRole: Exclude<UserRole, "admin"> = role;

        // Local registration
        // Check if user exists with deleted account
        const existingUsers = await UserModel.findUserByEmail(normalizedEmail);

        if (existingUsers.length > 0) {
            return NextResponse.json(
                { success: false, data: { mssg: "email exists" } },
                { status: 400 }
            );
        }

        // Check if phone already exists
        if (phone && phone !== "null") {
            const phoneExists = await UserModel.countPhone(phone);
            if (phoneExists > 0) {
                return NextResponse.json(
                    { success: false, data: { mssg: "phone exists" } },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const user = await UserModel.createUserDoc({
            fname: fname.trim(),
            lname: lname.trim(),
            email: normalizedEmail,
            phone: phone || null,
            password: hashedPassword,
            role: userRole
        });

        if (!user) {
            return NextResponse.json(
                { success: false, data: { mssg: "Failed to create user" } },
                { status: 400 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, email: user.email },
            getJwtSecret(secretValue),
            { expiresIn: "7d" }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        const response = NextResponse.json({
            success: true,
            message: "User created successfully",
            cookie: token,
            user: userWithoutPassword,
        });

        response.cookies.set("user_token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (err) {
        return NextResponse.json(
            { success: false, data: { mssg: err instanceof Error ? err.message : "An error occurred" } },
            { status: 500 }
        );
    }
}
