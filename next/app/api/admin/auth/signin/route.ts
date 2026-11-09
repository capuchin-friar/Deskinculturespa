import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
import bcrypt from "bcryptjs";
import { readJsonObject } from "../../../shared/utils/request";
import { UserModel } from "../../../shared/models/user";
import { attachAdminSession, createAdminToken } from "../../../shared/adminAuth";
import { getAdminJwtSecret } from "../../../shared/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) {
      return NextResponse.json({ success: false, data: "Enter your email and password." }, { status: 400 });
    }
    if (!getAdminJwtSecret()) {
      return NextResponse.json({ success: false, data: "Server configuration error (JWT)." }, { status: 500 });
    }

    const users = await UserModel.findUserByEmailNormalized(email);
    const user = users[0];
    if (!user) {
      return NextResponse.json({ success: false, data: "Invalid credentials." }, { status: 401 });
    }
    if (String(user.role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ success: false, data: "This account is not an admin account." }, { status: 403 });
    }

    const stored = String(user.password || "");
    const passwordMatch = stored.startsWith("$2") ? await bcrypt.compare(password, stored) : stored === password;
    if (!passwordMatch) {
      return NextResponse.json({ success: false, data: "Invalid credentials." }, { status: 401 });
    }

    const { password: _password, ...userWithoutPassword } = user;
    const token = createAdminToken(user);
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
    });
    return attachAdminSession(response, token);
  } catch (error) {
    console.error("Admin signin failed", error);
    return NextResponse.json({ success: false, data: "Something went wrong. Please try again in a moment." }, { status: 500 });
  }
}
