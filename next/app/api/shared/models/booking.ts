import { db, query } from "../database";
import type { NewBookingDoc, UpdateBookingDoc } from "../types/booking";
import { withErrorHandling } from "../utils/errHandler";

export class BookingModel {
  static createBookingDoc = withErrorHandling(async (payload: NewBookingDoc) => {
    const { user_id, service_id, notes = null } = payload;
    const client = await db();

    try {
      await client.query("BEGIN");

      // Serialize changes to one customer's active booking set with batch scheduling.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        [user_id, "customer-bookings"],
      );

      // Serialize attempts for the same customer/service pair so repeated or
      // concurrent requests cannot create duplicate active bookings.
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        [user_id, service_id],
      );

      const existing = await client.query(
        `SELECT *
         FROM bookings
         WHERE user_id = $1 AND service_id = $2
           AND status IN ('pending', 'confirmed')
         ORDER BY id DESC
         LIMIT 1`,
        [user_id, service_id],
      );

      if (existing.rows[0]) {
        await client.query("COMMIT");
        return existing.rows[0];
      }

      const { rows } = await client.query(
        `INSERT INTO bookings (user_id, service_id, price, notes)
         SELECT $1, s.id, s.price, $3
         FROM services s
         WHERE s.id = $2 AND s.is_active = TRUE
         RETURNING *`,
        [user_id, service_id, notes],
      );

      await client.query("COMMIT");
      return rows[0] ?? null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

  static getAllBookingDocs = withErrorHandling(async (payload: { user_id: string }) => {
    const { rows } = await query(
      `SELECT
         b.id,
         b.user_id,
         b.service_id,
         b.scheduled_at,
         b.price,
         b.status,
         b.payment_status,
         b.notes,
         b.created_at,
         b.updated_at,
         s.category,
         s.subcategory,
         s.description,
         s.duration_minutes,
         s.image_url
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       WHERE b.user_id = $1
       ORDER BY b.scheduled_at DESC`,
      [payload.user_id],
    );

    return rows;
  });

  static getBookingDoc = withErrorHandling(async (payload: { id: string; user_id: string }) => {
    const { rows } = await query(
      `SELECT
         b.*,
         s.category,
         s.subcategory,
         s.description,
         s.duration_minutes,
         s.image_url
       FROM bookings b
       INNER JOIN services s ON s.id = b.service_id
       WHERE b.id = $1 AND b.user_id = $2`,
      [payload.id, payload.user_id],
    );

    return rows[0] ?? null;
  });

  static updateBookingDoc = withErrorHandling(async (payload: UpdateBookingDoc) => {
    const { id, user_id, notes, status, payment_status } = payload;

    const { rows } = await query(
      `UPDATE bookings
       SET notes = COALESCE($1, notes),
           status = COALESCE($2, status),
           payment_status = COALESCE($3, payment_status),
           updated_at = NOW()
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [notes ?? null, status ?? null, payment_status ?? null, id, user_id],
    );

    return rows[0] ?? null;
  });

  static deleteBookingDoc = withErrorHandling(async (payload: { id: string; user_id: string }) => {
    const { rowCount } = await query(
      `DELETE FROM bookings WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
      [payload.id, payload.user_id],
    );

    return rowCount;
  });
}
