import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { readJsonObject } from "../../../shared/utils/request";
import { UserModel } from "../../../shared/models/user";
import { attachAdminSession, createAdminToken } from "../../../shared/adminAuth";
import { getAdminJwtSecret } from "../../../shared/jwt";

const SALT_ROUNDS = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await readJsonObject(request);
    const fname = typeof body.fname === "string" ? body.fname.trim() : "";
    const lname = typeof body.lname === "string" ? body.lname.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!fname || !lname || !email || password.length < 8) {
      return NextResponse.json(
        { success: false, data: { mssg: "Enter your name, email, and a password of at least 8 characters." } },
        { status: 400 },
      );
    }

    if (!getAdminJwtSecret()) {
      return NextResponse.json(
        { success: false, data: { mssg: "Server configuration error (JWT)." } },
        { status: 500 },
      );
    }

    const existingUsers = await UserModel.findUserByEmailNormalized(email);
    if (existingUsers.length > 0) {
      return NextResponse.json({ success: false, data: { mssg: "An account with this email already exists." } }, { status: 400 });
    }

    if (phone) {
      const phoneExists = await UserModel.countPhone(phone);
      if (phoneExists > 0) {
        return NextResponse.json({ success: false, data: { mssg: "An account with this phone number already exists." } }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await UserModel.createUserDoc({
      fname,
      lname,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: "admin",
    });

    if (!user) {
      return NextResponse.json({ success: false, data: { mssg: "Could not create this admin account." } }, { status: 400 });
    }

    const { password: _password, ...userWithoutPassword } = user;
    const token = createAdminToken(user);
    const response = NextResponse.json({
      success: true,
      message: "Admin account created",
      user: userWithoutPassword,
    }, { status: 201 });
    return attachAdminSession(response, token);
  } catch (error) {
    console.error("Admin signup failed", error);
    return NextResponse.json(
      { success: false, data: { mssg: "Could not finish creating this admin account. Try signing in, or try again." } },
      { status: 500 },
    );
  }
}
