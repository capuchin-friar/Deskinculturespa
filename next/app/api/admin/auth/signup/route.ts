/**
 * Admin Signup API Route
 * 
 * Handles admin registration for both local and OAuth providers.
 * 
 * @module app/api/admin/signup/route
 */

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AdminModel } from "../../../lib/models/admin";
import { getJwtSecret } from "../../../lib/jwt";

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
            role = "admin",
        } = body;

        // Local registration
        // Check if admin exists with deleted account
        const existingAdmins = await AdminModel.findAdminByEmail(email);

        if (existingAdmins.length > 0) {
            return NextResponse.json(
                { success: false, data: { mssg: "email exists" } },
                { status: 400 }
            );
        }

        // Check if phone already exists
        if (phone && phone !== "null") {
            const phoneExists = await AdminModel.countPhone(phone);
            if (phoneExists > 0) {
                return NextResponse.json(
                    { success: false, data: { mssg: "phone exists" } },
                    { status: 400 }
                );
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        // Create admin
        const admin = await AdminModel.createAdminDoc({
            fname,
            lname,
            email,
            phone: phone || null,
            password: hashedPassword,
            role
        });

        if (!admin) {
            return NextResponse.json(
                { success: false, data: { mssg: "Failed to create admin" } },
                { status: 400 }
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            getJwtSecret(process.env.ADMIN_JWT_SECRET as string),
            { expiresIn: "7d" }
        );

        // Remove password from response
        const { password: _, ...adminWithoutPassword } = admin;

        return NextResponse.json({
            success: true,
            message: "Admin created successfully",
            cookie: token,
            admin: adminWithoutPassword,
        });
    } catch (err) {
        return NextResponse.json(
            { success: false, data: { mssg: err instanceof Error ? err.message : "An error occurred" } },
            { status: 500 }
        );
    }
}

