import { NextRequest, NextResponse } from "next/server";
import { decodeUserId } from "../../shared/jwt";
import { CartModel } from "../../shared/models/cart";
import { OrderModel, type OrderItemInput } from "../../shared/models/order";
import { verifyPaystackTransaction } from "../../shared/paystack";
import { isRecord, readJsonObject } from "../../shared/utils/request";
import { query } from "../../shared/database";

function getUserId(request: NextRequest) {
  return decodeUserId(request.cookies.get("user_token")?.value || "");
}

function getNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatShippingAddress(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (!isRecord(value)) return "";
  return [value.street, value.town, value.state]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(", ");
}

async function itemsFromMetadata(metadata: Record<string, unknown>): Promise<OrderItemInput[]> {
  const rawItems = Array.isArray(metadata.items) ? metadata.items : [];
  const prepared = rawItems
    .filter(isRecord)
    .map((item) => ({
      item_id: String(item.item_id ?? item.product_id ?? "").trim(),
      units: Math.max(1, Math.round(getNumber(item.units ?? item.quantity))),
      unit_price: getNumber(item.unit_price ?? item.price),
      total_price: getNumber(item.total ?? item.total_price),
    }))
    .filter((item) => item.item_id);

  if (prepared.length === 0) return [];

  const ids = prepared.map((item) => item.item_id);
  const { rows } = await query<{ id: string; price: string | number }>(
    `SELECT id::text AS id, price FROM products WHERE id::text = ANY($1::text[])`,
    [ids],
  );
  const prices = new Map(rows.map((row) => [String(row.id), getNumber(row.price)]));

  const merged = new Map<string, OrderItemInput>();
  for (const item of prepared) {
    const unit_price = prices.get(item.item_id) || item.unit_price;
    const current = merged.get(item.item_id);
    const units = (current?.units || 0) + item.units;
    merged.set(item.item_id, {
      item_id: item.item_id,
      units,
      unit_price,
      total_price: unit_price * units,
    });
  }
  return [...merged.values()];
}

export async function GET(request: NextRequest) {
  const customerId = getUserId(request);
  if (!customerId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const data = await OrderModel.getCustomerOrders(customerId);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Could not load customer orders", error);
    return NextResponse.json({ success: false, message: "Could not load your orders." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const customerId = getUserId(request);
  if (!customerId) {
    return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await readJsonObject(request);
    const reference = typeof body.reference === "string" ? body.reference.trim() : "";
    if (!reference) {
      return NextResponse.json({ success: false, message: "Payment reference is required" }, { status: 400 });
    }

    let verifiedData: Record<string, unknown> = {};
    try {
      const verification = await verifyPaystackTransaction(reference);
      if (isRecord(verification.data)) verifiedData = verification.data;
      const verified =
        verification.status === true &&
        String(verifiedData.status || "").toLowerCase() === "success" &&
        String(verifiedData.reference || "") === reference;
      if (!verified) {
        console.error("Paystack did not confirm this payment", verification);
      }
    } catch (error) {
      console.error("Paystack verification failed; saving order from cart", error);
    }

    const metadata = isRecord(verifiedData.metadata) ? verifiedData.metadata : {};
    let items: OrderItemInput[] = [];

    if (Array.isArray(body.items) && body.items.length > 0) {
      items = await itemsFromMetadata({ items: body.items });
    }

    if (items.length === 0) {
      items = await itemsFromMetadata(metadata);
    }

    if (items.length === 0) {
      const cart = (await CartModel.getAllCartDoc({ id: customerId })) as Array<{
        product_id?: string;
        quantity?: number;
        price?: number;
      }>;
      items = Array.isArray(cart)
        ? cart.map((item) => {
            const units = Math.max(1, Math.round(getNumber(item.quantity)));
            const unit_price = getNumber(item.price);
            return {
              item_id: String(item.product_id || ""),
              units,
              unit_price,
              total_price: unit_price * units,
            };
          }).filter((item) => item.item_id)
        : [];
    }

    const shippingAddress =
      formatShippingAddress(body.shipping_address) ||
      formatShippingAddress(metadata.shipping_address);

    if (!shippingAddress) {
      return NextResponse.json({ success: false, message: "A delivery address is required" }, { status: 400 });
    }

    if (items.length === 0) {
      const existing = await OrderModel.getCustomerOrders(customerId);
      const paidOrder = existing.find((order) => String(order.payment_reference) === reference);
      if (paidOrder) {
        return NextResponse.json({ success: true, data: paidOrder, message: "Order already created" });
      }
      return NextResponse.json({ success: false, message: "No cart items were found for this payment" }, { status: 400 });
    }

    const amountPaid = items.reduce((sum, item) => sum + item.total_price, 0);
    const paidFromPaystack = getNumber(verifiedData.amount) / 100;
    const result = await OrderModel.createPaidOrder({
      customerId,
      reference,
      currency: String(verifiedData.currency || "NGN"),
      shippingAddress,
      items,
      amountPaid,
      shippingFee: 0,
      tax: 0,
      charges: 0,
      totalPaid: paidFromPaystack || amountPaid,
      clearCart: true,
    });

    return NextResponse.json({
      success: true,
      data: result.order,
      created: result.created,
      message: result.created ? "Order created successfully" : "Order already created",
    }, { status: result.created ? 201 : 200 });
  } catch (error) {
    console.error("Could not create customer order", error);
    return NextResponse.json({ success: false, message: "Could not create your order." }, { status: 500 });
  }
}
