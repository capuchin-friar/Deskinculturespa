import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { UserModel } from "./models/user";
import { getAdminJwtSecret } from "./jwt";

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.VERCEL === "1" || process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 60 * 60 * 24 * 7,
};

export function createAdminToken(user: { id: number | string; email?: string; fname?: string; lname?: string; role?: string }) {
  const secret = getAdminJwtSecret();
  if (!secret) {
    throw new Error("Admin JWT secret is not configured");
  }
  const displayName = [user.fname, user.lname].filter(Boolean).join(" ").trim();
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: "admin",
      ...(displayName ? { name: displayName } : {}),
    },
    secret,
    { expiresIn: "7d" },
  );
}

export function attachAdminSession(response: NextResponse, token: string) {
  response.cookies.set("admin_token", token, cookieOptions);
  return response;
}

export function clearAdminSession(response: NextResponse) {
  response.cookies.set("admin_token", "", { ...cookieOptions, maxAge: 0 });
  return response;
}

function tokenId(token: string): number | null {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !("id" in decoded)) return null;
  const id = Number(decoded.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;
  return id;
}

function tokenRole(token: string): string {
  const decoded = jwt.decode(token);
  if (!decoded || typeof decoded !== "object" || !("role" in decoded)) return "";
  return String(decoded.role || "").toLowerCase();
}

export async function getRequestAdminId(request: NextRequest): Promise<number | null> {
  const adminToken = request.cookies.get("admin_token")?.value || "";
  const userToken = request.cookies.get("user_token")?.value || "";
  const token = adminToken || userToken;
  if (!token) return null;

  const id = tokenId(token);
  if (!id) return null;
  if (tokenRole(token) === "admin") return id;
  if (adminToken) return id;

  const users = await UserModel.findUserById(id);
  return String(users[0]?.role || "").toLowerCase() === "admin" ? id : null;
}
