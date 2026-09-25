import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/database";
import type { PaystackTransaction } from "../../../lib/payments/paystack";
import { recordPaystackPayment } from "../../../lib/payments/settle";

export const runtime = "nodejs";

function isValidSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret || !signature) return false;

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const providedBuffer = Buffer.from(signature, "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer);
}

export const POST = async (request: NextRequest) => {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!isValidSignature(rawBody, signature)) {
    return NextResponse.json({ success: false, data: "Invalid webhook signature" }, { status: 401 });
  }

  let event: { event?: string; data?: PaystackTransaction };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, data: "Invalid webhook payload" }, { status: 400 });
  }

  // Paystack recommends acknowledging webhooks quickly. This handler only performs
  // the small, idempotent database update required for charge.success.
  if (event.event !== "charge.success" || !event.data?.reference) {
    return NextResponse.json({ success: true, ignored: true });
  }

  const client = await db();
  try {
    await recordPaystackPayment(client, event.data.reference, event.data);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Paystack webhook processing failed", error);
    return NextResponse.json({ success: false }, { status: 500 });
  } finally {
    client.release();
  }
};
