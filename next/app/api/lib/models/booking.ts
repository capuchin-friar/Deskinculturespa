import { query } from "../database";
import type { NewBookingDoc, UpdateBookingDoc } from "../types/booking";
import { withErrorHandling } from "../utils/errHandler";

export class BookingModel {
  static createBookingDoc = withErrorHandling(async (payload: NewBookingDoc) => {
    const { user_id, service_id, scheduled_at, notes = null } = payload;

    const { rows } = await query(
      `INSERT INTO bookings (user_id, service_id, scheduled_at, price, notes)
       SELECT $1, s.id, $3, s.price, $4
       FROM services s
       WHERE s.id = $2 AND s.is_active = TRUE
       RETURNING *`,
      [user_id, service_id, scheduled_at, notes],
    );

    return rows[0] ?? null;
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
    const { id, user_id, scheduled_at, notes, status, payment_status } = payload;

    const { rows } = await query(
      `UPDATE bookings
       SET scheduled_at = COALESCE($1, scheduled_at),
           notes = COALESCE($2, notes),
           status = COALESCE($3, status),
           payment_status = COALESCE($4, payment_status),
           updated_at = NOW()
       WHERE id = $5 AND user_id = $6
       RETURNING *`,
      [scheduled_at ?? null, notes ?? null, status ?? null, payment_status ?? null, id, user_id],
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
