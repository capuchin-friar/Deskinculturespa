/**
 * User Signup API Route
 * 
 * Handles user registration for both local and OAuth providers.
 * 
 * @module app/api/user/signup/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../../lib/models/user";
import { getJwtSecret } from "../../lib/jwt";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            fname,
            lname,
            email,
            phone,
            password,
            role,
        } = body;

        // Local registration
        // Check if user exists with deleted account
        const existingUsers = await UserModel.findUserByEmail(email);

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
            fname,
            lname,
            email,
            phone: phone || null,
            password: hashedPassword,
            role
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
            getJwtSecret(process.env.ADMIN_JWT_SECRET as string),
            { expiresIn: "7d" }
        );

        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            cookie: token,
            user: userWithoutPassword,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, data: { mssg: err instanceof Error ? err.message : "An error occurred" } },
            { status: 500 }
        );
    }
}

