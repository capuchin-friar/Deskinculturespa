import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { readJsonObject } from "../../shared/utils/request";
import { PackageBookingModel } from "../../shared/models/packageBooking";

function getUserId(request: NextRequest) {
  return decodeUserId(request.cookies.get("user_token")?.value || "");
}

export async function GET(request: NextRequest) {
  const user_id = getUserId(request);
  if (!user_id) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  try {
    const data = await PackageBookingModel.getAllPackageBookingDocs({ user_id });
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not load package bookings", error);
    return NextResponse.json({ success: false, message: "Could not load your packages." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user_id = getUserId(request);
  if (!user_id) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }
  try {
    const body = await readJsonObject(request);
    const package_id = String(body.package_id ?? "").trim();
    if (!/^\d+$/.test(package_id)) {
      return NextResponse.json({ success: false, message: "A valid package is required." }, { status: 400 });
    }
    const data = await PackageBookingModel.createPackageBookingDoc({ user_id, package_id });
    if (!data) {
      return NextResponse.json({ success: false, message: "Package not found or unavailable." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      data,
      message: "Package added to your bookings.",
    }, { status: 201 });
  } catch (error) {
    console.error("Could not book package", error);
    return NextResponse.json({ success: false, message: "Could not book this package." }, { status: 500 });
  }
}
