import { NextResponse } from "next/server";
import { clearAdminSession } from "../../../shared/adminAuth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Signed out" });
  return clearAdminSession(response);
}
