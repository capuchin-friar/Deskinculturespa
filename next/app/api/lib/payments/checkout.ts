import { db } from "../database";
import { initializePaystackTransaction } from "./paystack";

export async function createPendingPayment(input: {
  orderId: number;
  customerId: number;
  orderType: "product" | "service" | "appointment";
  amount: number;
  email: string;
}) {
  const client = await db();
  const reference = `dsc_${input.orderType}_${input.orderId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  try {
    await client.query("BEGIN");

    const transactionResult = await client.query(
      `INSERT INTO transactions (
         order_id, customer_id, provider, reference, amount, currency, status, metadata
       ) VALUES ($1,$2,'paystack',$3,$4,'NGN','pending',$5)
       RETURNING id, reference, amount, currency`,
      [
        input.orderId,
        input.customerId,
        reference,
        input.amount,
        JSON.stringify({ order_type: input.orderType }),
      ],
    );

    await client.query("COMMIT");

    try {
      const payment = await initializePaystackTransaction({
        email: input.email,
        amount: input.amount,
        reference,
        orderId: input.orderId,
        orderType: input.orderType,
      });

      await client.query(
        `UPDATE transactions
         SET metadata = metadata || $1::jsonb, updated_at = NOW()
         WHERE id = $2`,
        [JSON.stringify({ access_code: payment.access_code }), transactionResult.rows[0].id],
      );

      return {
        transactionId: transactionResult.rows[0].id,
        reference,
        authorizationUrl: payment.authorization_url,
        accessCode: payment.access_code,
      };
    } catch (error) {
      await client.query(
        `UPDATE transactions SET status = 'failed', updated_at = NOW() WHERE id = $1`,
        [transactionResult.rows[0].id],
      );
      throw error;
    }
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch {}
    throw error;
  } finally {
    client.release();
  }
}
