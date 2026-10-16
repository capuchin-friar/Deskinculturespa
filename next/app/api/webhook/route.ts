import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { db } from "../shared/database";
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

    for (const value of orders.items) {
      if (!isObject(value)) {
        throw new Error("Invalid order details in Paystack metadata");
      }

      const o = value;
      if (/*!Array.isArray(items)**/ typeof o !== "object") {
        throw new Error("Invalid order items in Paystack metadata");
      }
      const subtotal = getNumber(orders.subtotal ?? 0);
      const shippingFee = getNumber(o.shipping_fee ?? 0);
      const tax = getNumber(metadata.tax);
      const charges = 0;
      const totalPaid = subtotal + shippingFee + tax + charges;
      console.log("shippingAddress", shippingAddress)
      const { rows } = await client.query<{ id: number }>(
        `INSERT INTO orders(
          customer_id, amount_paid, shipping_fee, tax, charges, total_paid,
          currency, fulfillment_status, payment_status, shipping_address,
          payment_reference, shipping_method, tracking_number
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, '')
        RETURNING id`,
        [
          customerId,
          subtotal,
          shippingFee,
          tax,
          charges,
          totalPaid,
          getString(verifiedData.currency) || "NGN",
          "order_placed",
          "pending",
          shippingAddress,
          reference,
          getString(o.shipping_method) || "3rd part logistics",
        ],
      );
      const orderId = rows[0]?.id;
      if (!orderId) {
        throw new Error("Could not create order");
      }

    //   await client.query(
    //     `INSERT INTO order_events(
    //       order_id, event_type, stage, actor_type, actor_id, outcome, notes, meta
    //     ) VALUES($1, 'payment', 'payment_received', 'customer', $2, 'success', $3, $4)`,
    //     [
    //       orderId,
    //       customerId,
    //       `Payment received via Paystack - Reference: ${reference}`,
    //       JSON.stringify({
    //         channel: verifiedData.channel,
    //         paystack_charge_id: verifiedData.id,
    //         paid_at: verifiedData.paid_at,
    //       }),
    //     ],
    //   );

      await client.query(
        `INSERT INTO order_items(order_id, item_id, units, unit_price, total_price)
        VALUES($1, $2, $3, $4, $5)`,
        [
          orderId,
          String(o.item_id ?? ""),
          getNumber(o.units ?? o.quantity),
          getNumber(o.unit_price),
          getNumber(o.total),
        ],
      );
      
    }

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
