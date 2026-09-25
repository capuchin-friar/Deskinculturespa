import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { requireUser } from "../../lib/auth/user";
import { verifyPaystackTransaction } from "../../lib/payments/paystack";
import { recordPaystackPayment } from "../../lib/payments/settle";

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser(request);
    const { reference } = await request.json();

    if (typeof reference !== "string" || !reference.trim()) {
      return NextResponse.json({ success: false, data: "Payment reference is required" }, { status: 400 });
    }

    const client = await db();
    try {
      const ownership = await client.query(
        `SELECT 1 FROM transactions WHERE reference = $1 AND customer_id = $2`,
        [reference.trim(), user.id],
      );
      if (ownership.rows.length === 0) {
        return NextResponse.json({ success: false, data: "Payment transaction not found" }, { status: 404 });
      }
    } finally {
      client.release();
    }

    const paystackTransaction = await verifyPaystackTransaction(reference.trim());
    const status = paystackTransaction.status;

    const settlementClient = await db();
    try {
      const result = await recordPaystackPayment(settlementClient, reference.trim(), paystackTransaction);
      return NextResponse.json({
        success: true,
        data: {
          order_id: result.orderId,
          reference: reference.trim(),
          status,
          paid: status === "success",
        },
      });
    } finally {
      settlementClient.release();
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to verify payment";
    const status = message.includes("AUTHENTICATION") ? 401 : 500;
    return NextResponse.json({ success: false, data: message }, { status });
  }
};
