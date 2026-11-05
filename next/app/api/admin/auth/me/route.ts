import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "../../../shared/adminAuth";
import { UserModel } from "../../../shared/models/user";

export async function GET(request: NextRequest) {
  const adminId = await getRequestAdminId(request);
  if (!adminId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const users = await UserModel.findUserById(adminId);
  const user = users[0];
  if (!user || String(user.role || "").toLowerCase() !== "admin") {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  const { password: _password, ...safeUser } = user;
  return NextResponse.json({ success: true, data: safeUser });
}
