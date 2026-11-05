import { NextRequest, NextResponse } from "next/server";
import { getRequestAdminId } from "@/app/api/shared/adminAuth";
import { OrderModel } from "../../../shared/models/order";
import { readJsonObject } from "../../../shared/utils/request";

const PRODUCT_STATUSES = new Set([
  "order_placed",
  "processing",
  "ready_for_pickup",
  "shipped",
  "delivered",
  "cancelled",
]);
const VISIT_STATUSES = new Set(["pending", "confirmed", "completed", "cancelled"]);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getRequestAdminId(request);
  if (!adminId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const kind = String(request.nextUrl.searchParams.get("kind") || "product");
    const data = await OrderModel.getAdminOrder(kind, id);
    if (!data) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not load admin order", error);
    return NextResponse.json({ success: false, message: "Could not load this record." }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminId = await getRequestAdminId(request);
  if (!adminId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const kind = String(request.nextUrl.searchParams.get("kind") || "product");
    const body = await readJsonObject(request);
    const allowed = kind === "product" ? PRODUCT_STATUSES : VISIT_STATUSES;
    const status = typeof body.status === "string" ? body.status.trim().toLowerCase() : undefined;
    if (status && !allowed.has(status)) {
      return NextResponse.json({ success: false, message: "That status is not supported." }, { status: 400 });
    }

    const data = await OrderModel.updateAdminOrder(
      kind,
      id,
      {
        status,
        shipping_method: typeof body.shipping_method === "string" ? body.shipping_method.trim() : undefined,
        logistic_provider: typeof body.logistic_provider === "string" ? body.logistic_provider.trim() : undefined,
        tracking_number: typeof body.tracking_number === "string" ? body.tracking_number.trim() : undefined,
        estimated_delivery_date:
          body.estimated_delivery_date === null || typeof body.estimated_delivery_date === "string"
            ? String(body.estimated_delivery_date || "")
            : undefined,
        note: typeof body.note === "string" ? body.note.trim() : undefined,
      },
      adminId,
    );

    if (!data) {
      return NextResponse.json({ success: false, message: "Record not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not update admin order", error);
    return NextResponse.json({ success: false, message: "Could not update this record." }, { status: 500 });
  }
}
