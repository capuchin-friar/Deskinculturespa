import type { PoolClient } from "pg";
import type { PaystackTransaction } from "./paystack";

export async function recordPaystackPayment(
  client: PoolClient,
  reference: string,
  data: PaystackTransaction,
) {
  await client.query("BEGIN");

  try {
    const transactionResult = await client.query(
      `SELECT
         t.id,
         t.order_id,
         t.customer_id,
         t.amount,
         t.currency,
         o.order_type,
         o.payment_status AS order_payment_status
       FROM transactions t
       INNER JOIN orders o ON o.id = t.order_id
       WHERE t.reference = $1
       FOR UPDATE`,
      [reference],
    );

    const transaction = transactionResult.rows[0];
    if (!transaction) throw new Error("Local payment transaction not found");

    const expectedKobo = Math.round(Number(transaction.amount) * 100);
    if (Number(data.amount) !== expectedKobo || data.currency !== transaction.currency) {
      throw new Error("Paystack amount or currency does not match the local transaction");
    }

    await client.query(
      `INSERT INTO paystack_transactions (
         transaction_id, paystack_id, reference, status, amount, currency,
         channel, gateway_response, paid_at, customer_email, authorization,
         raw_response, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,NOW())
       ON CONFLICT (reference) DO UPDATE SET
         paystack_id = EXCLUDED.paystack_id,
         status = EXCLUDED.status,
         amount = EXCLUDED.amount,
         currency = EXCLUDED.currency,
         channel = EXCLUDED.channel,
         gateway_response = EXCLUDED.gateway_response,
         paid_at = EXCLUDED.paid_at,
         customer_email = EXCLUDED.customer_email,
         authorization = EXCLUDED.authorization,
         raw_response = EXCLUDED.raw_response,
         updated_at = NOW()`,
      [
        transaction.id,
        data.id,
        data.reference,
        data.status,
        data.amount,
        data.currency,
        data.channel || null,
        data.gateway_response || null,
        data.paid_at || null,
        data.customer?.email || null,
        data.authorization || null,
        data,
      ],
    );

    const success = data.status === "success";

    await client.query(
      `UPDATE transactions
       SET status = $1,
           paid_at = CASE WHEN $1 = 'success' THEN COALESCE($2, NOW()) ELSE paid_at END,
           updated_at = NOW()
       WHERE id = $3`,
      [success ? "success" : data.status, data.paid_at || null, transaction.id],
    );

    if (success && transaction.order_payment_status !== "paid") {
      await client.query(
        `UPDATE orders
         SET payment_status = 'paid',
             status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
             amount_paid = total_amount,
             total_paid = total_amount,
             payment_reference = $1,
             updated_at = NOW()
         WHERE id = $2`,
        [reference, transaction.order_id],
      );

      if (transaction.order_type === "product") {
        // The order contains immutable product snapshots, so the cart can be cleared
        // safely and repeated webhooks remain idempotent.
        await client.query(
          `DELETE FROM cart_items WHERE user_id = $1`,
          [transaction.customer_id],
        );
      }

      if (transaction.order_type === "service") {
        await client.query(
          `UPDATE bookings
           SET payment_status = 'paid',
               status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
               updated_at = NOW()
           WHERE order_id = $1`,
          [transaction.order_id],
        );
      }

      if (transaction.order_type === "appointment") {
        await client.query(
          `UPDATE appointments
           SET payment_status = 'paid',
               status = CASE WHEN status = 'pending' THEN 'confirmed' ELSE status END,
               updated_at = NOW()
           WHERE order_id = $1`,
          [transaction.order_id],
        );
      }
    }

    await client.query("COMMIT");
    return { orderId: transaction.order_id, status: data.status };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}
