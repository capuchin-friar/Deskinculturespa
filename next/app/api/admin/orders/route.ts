import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { OrderModel } from "../../shared/models/order";

export async function GET(request: NextRequest) {
  const adminId = await getRequestAdminId(request);
  if (!adminId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const kind = String(request.nextUrl.searchParams.get("kind") || "all").toLowerCase();
    const rows = await OrderModel.getAdminOrders();
    const data =
      kind === "products" || kind === "product"
        ? rows.filter((row) => row.kind === "product")
        : kind === "services" || kind === "service"
          ? rows.filter((row) => row.kind === "service")
          : kind === "appointment" || kind === "appointments"
            ? rows.filter((row) => row.kind === "appointment")
            : kind === "packages" || kind === "package"
              ? rows.filter((row) => row.kind === "package")
              : rows;

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not load admin orders", error);
    return NextResponse.json({ success: false, message: "Could not load orders." }, { status: 500 });
  }
}
