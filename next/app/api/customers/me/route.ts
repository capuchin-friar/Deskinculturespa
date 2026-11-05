import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { UserModel } from "../../shared/models/user";

export async function GET(request: NextRequest) {
  const userId = decodeUserId(request.cookies.get("user_token")?.value || "");
  if (!userId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const users = await UserModel.findUserById(Number(userId));
    const user = users[0];
    if (!user) {
      return NextResponse.json({ success: false, message: "Account not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fname: user.fname,
        lname: user.lname,
        phone: user.phone || "",
      },
    });
  } catch (error) {
    console.error("Could not load customer profile", error);
    return NextResponse.json({ success: false, message: "Could not load your account." }, { status: 500 });
  }
}
