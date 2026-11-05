import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../shared/database";
import { OrderModel } from "../shared/models/order";
import { generatePaystackSignature } from "../shared/paystack";

export const runtime = "nodejs";

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function verifyTransaction(reference: string, secret: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Paystack verification failed with status ${response.status}`);
  }

  return (await response.json()) as unknown;
}

export async function POST(request: NextRequest) {
  const secret = String(
    process.env.PAYSTACK_SECRET_KEY || process.env.paystack_secret_key || "",
  )
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/^Bearer\s+/i, "");
  if (!secret) {
    return NextResponse.json(
      { success: false, message: "Missing Paystack secret" },
      { status: 500 },
    );
  }

  let rawBody: Buffer;
  try {
    rawBody = Buffer.from(await request.arrayBuffer());
  } catch (error) {
    console.error("Could not read Paystack webhook body", error);
    return NextResponse.json(
      { success: false, message: "Could not read request body" },
      { status: 400 },
    );
  }

  if (rawBody.length === 0) {
    return NextResponse.json(
      { success: false, message: "Missing request body" },
      { status: 400 },
    );
  }

  const signature = request.headers.get("x-paystack-signature");
  const expectedSignature = generatePaystackSignature(rawBody, secret);
  const signatureIsHex = signature && /^[a-f\d]{128}$/i.test(signature);
  const suppliedSignature =
    signatureIsHex && signature ? Buffer.from(signature, "hex") : Buffer.alloc(0);
  const expectedSignatureBytes = Buffer.from(expectedSignature, "hex");

  if (
    suppliedSignature.length !== expectedSignatureBytes.length ||
    !timingSafeEqual(suppliedSignature, expectedSignatureBytes)
  ) {
    return NextResponse.json(
      { success: false, message: "Invalid signature", s:  expectedSignature},
      { status: 401 },
    );
  }

  let webhook: unknown;
  try {
    webhook = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid JSON body" },
      { status: 400 },
    );
  }

  if (!isObject(webhook) || !isObject(webhook.data)) {
    return NextResponse.json(
      { success: false, message: "Invalid Paystack event" },
      { status: 400 },
    );
  }

  const eventType = getString(webhook.event);
  const paystackData = webhook.data;

  if (eventType !== "charge.success") {
    return NextResponse.json(
      { success: true, message: "Event acknowledged" },
      { status: 200 },
    );
  }

  const reference = getString(paystackData.reference);
  if (!reference) {
    return NextResponse.json(
      { success: false, message: "Missing transaction reference" },
      { status: 400 },
    );
  }

//   let verification: unknown;
//   try {
//     verification = await verifyTransaction(reference, secret);
//   } catch (error) {
//     console.error("Paystack transaction verification failed", error);
//     return NextResponse.json(
//       { success: false, message: "Could not verify payment" },
//       { status: 502 },
//     );
//   }

//   if (!isObject(verification) || !isObject(verification.data)) {
//     return NextResponse.json(
//       { success: false, message: "Invalid response from Paystack verification" },
//       { status: 502 },
//     );
//   }

//   const verifiedData = verification.data;
  const verifiedData = webhook.data;
//   if (
//     verification.status !== true ||
//     getString(verifiedData.status).toLowerCase() !== "success" ||
//     getString(verifiedData.reference) !== reference
//   ) {
//     return NextResponse.json(
//       { success: false, message: "Payment not verified" },
//       { status: 401 },
//     );
//   }

  const metadata = isObject(verifiedData.metadata) ? verifiedData.metadata : {};
  const orders = metadata;
  if (!Array.isArray(orders.items) || orders?.items.length === 0) {
    return NextResponse.json(
      { success: false, message: "No order details supplied with payment" },
      { status: 400 },
    );
  }

  const customer = isObject(verifiedData.customer) ? verifiedData.customer : {};
  const customerId = String(
    metadata.customer_id || getString(customer.email) || "",
  );
  const shippingAddress = getString(JSON.stringify(metadata.shipping_address));
  if (!customerId) {
    return NextResponse.json(
      { success: false, message: "Missing customer details" },
      { status: 400 },
    );
  }

  let client: Awaited<ReturnType<typeof db>>;
  try {
    client = await db();
  } catch (error) {
    console.error("Could not connect to the database for Paystack webhook", error);
    return NextResponse.json(
      { success: false, message: "Could not process webhook" },
      { status: 500 },
    );
  }

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO paystack_webhook_deliveries(
        id, body_hash, reference, paystack_event, created_at
      ) VALUES(DEFAULT, $1, $2, $3, NOW())`,
      [
        createHash("sha256").update(rawBody).digest("hex"),
        reference,
        eventType,
      ],
    );

    const { rows: existingOrders } = await client.query(
      "SELECT id FROM orders WHERE payment_reference = $1 LIMIT 1",
      [reference],
    );
    if (existingOrders.length > 0) {
      await client.query("COMMIT");
      return NextResponse.json(
        { success: true, message: "Order already processed" },
        { status: 200 },
      );
    }

    await client.query(
      `INSERT INTO paystack_transactions(
        id, paystack_charge_id, reference, event, amount, currency, status,
        channel, customer_email, metadata, paid_at, raw_payload, created_at, updated_at
      ) VALUES(DEFAULT, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
      [
        verifiedData.id,
        reference,
        eventType,
        getNumber(verifiedData.amount) / 100,
        getString(verifiedData.currency),
        getString(verifiedData.status),
        getString(verifiedData.channel),
        getString(customer.email),
        JSON.stringify(metadata),
        verifiedData.paid_at ?? null,
        rawBody.toString("utf8"),
      ],
    );

    const items = orders.items
      .filter(isObject)
      .map((item) => {
        const units = Math.max(1, Math.round(getNumber(item.units ?? item.quantity)));
        const unitPrice = getNumber(item.unit_price ?? item.price);
        return {
          item_id: String(item.item_id ?? item.product_id ?? ""),
          units,
          unit_price: unitPrice,
          total_price: getNumber(item.total ?? item.total_price) || unitPrice * units,
        };
      })
      .filter((item) => item.item_id);

    if (items.length === 0) {
      throw new Error("Invalid order items in Paystack metadata");
    }

    const { rows: matchedUsers } = await client.query<{ id: string | number }>(
      `SELECT id FROM users WHERE $1 <> '' AND LOWER(TRIM(email)) = LOWER(TRIM($1)) LIMIT 1`,
      [getString(customer.email)],
    );
    const resolvedCustomerId = String(matchedUsers[0]?.id || customerId);
    const subtotal = getNumber(orders.subtotal) || items.reduce((sum, item) => sum + item.total_price, 0);
    const shippingFee = getNumber(metadata.shipping_fee);
    const tax = getNumber(metadata.tax);
    const charges = 0;

    await OrderModel.createPaidOrderWithClient(client, {
      customerId: resolvedCustomerId,
      reference,
      currency: getString(verifiedData.currency) || "NGN",
      shippingAddress,
      shippingMethod: "standard",
      items,
      amountPaid: subtotal,
      shippingFee,
      tax,
      charges,
      totalPaid: getNumber(verifiedData.amount) / 100 || subtotal + shippingFee + tax + charges,
      clearCart: true,
    });

    await client.query("COMMIT");

    return NextResponse.json(
      { success: true, message: "Webhook processed successfully" },
      { status: 200 },
    );
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Could not roll back Paystack webhook transaction", rollbackError);
    }
    console.error("Paystack webhook processing failed", error);
    return NextResponse.json(
      { success: false, message: "Webhook processing failed" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
