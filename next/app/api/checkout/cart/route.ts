import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/database";
import { requireUser } from "../../lib/auth/user";
import { createPendingPayment } from "../../lib/payments/checkout";

export const POST = async (request: NextRequest) => {
  try {
    const user = await requireUser(request);
    const body = await request.json().catch(() => ({}));
    const shippingAddress = typeof body.shipping_address === "string"
      ? body.shipping_address.trim()
      : null;

    const client = await db();
    let orderId: number;
    let total: number;

    try {
      await client.query("BEGIN");

      const cartResult = await client.query(
        `SELECT c.product_id, c.quantity, p.name, p.price, p.stock
         FROM cart_items c
         INNER JOIN products p ON p.id = c.product_id
         WHERE c.user_id = $1
         FOR UPDATE OF c, p`,
        [user.id],
      );

      if (cartResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json({ success: false, data: "Your cart is empty" }, { status: 400 });
      }

      const unavailable = cartResult.rows.find(
        (item) => Number(item.quantity) > Number(item.stock),
      );
      if (unavailable) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          { success: false, data: `${unavailable.name} does not have enough stock` },
          { status: 409 },
        );
      }

      total = cartResult.rows.reduce(
        (sum, item) => sum + Number(item.price) * Number(item.quantity),
        0,
      );

      const orderResult = await client.query(
        `INSERT INTO orders (
           customer_id, order_type, status, payment_status,
           amount_paid, shipping_fee, currency, discount, total_paid,
           total_amount, shipping_address
         ) VALUES ($1,'product','pending','pending',0,0,'NGN',0,0,$2,$3)
         RETURNING id`,
        [user.id, total, shippingAddress],
      );
      orderId = Number(orderResult.rows[0].id);

      for (const item of cartResult.rows) {
        const lineTotal = Number(item.price) * Number(item.quantity);
        await client.query(
          `INSERT INTO order_items (
             order_id, product_id, product_name, unit_price, quantity, line_total
           ) VALUES ($1,$2,$3,$4,$5,$6)`,
          [orderId, item.product_id, item.name, item.price, item.quantity, lineTotal],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }

    const payment = await createPendingPayment({
      orderId,
      customerId: Number(user.id),
      orderType: "product",
      amount: total,
      email: user.email,
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: orderId,
        transaction_id: payment.transactionId,
        reference: payment.reference,
        authorization_url: payment.authorizationUrl,
        access_code: payment.accessCode,
      },
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to initialize checkout";
    const status = message.includes("AUTHENTICATION") ? 401 : 500;
    return NextResponse.json({ success: false, data: message }, { status });
  }
};
