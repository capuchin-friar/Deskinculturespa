import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../../shared/jwt";
import { OrderModel } from "../../../shared/models/order";

function getUserId(request: NextRequest) {
  return decodeUserId(request.cookies.get("user_token")?.value || "");
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const customerId = getUserId(request);
  if (!customerId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await OrderModel.getCustomerOrder(customerId, id);
    if (!data) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not load customer order", error);
    return NextResponse.json({ success: false, message: "Could not load this order." }, { status: 500 });
  }
}
