/**
 * Handles database operations related to product carts.
 *
 * @module app/api/lib/models/cart
 */

import { query } from "../database";
import type { NewCartDoc } from "../types/user";
import { withErrorHandling } from "../utils/errHandler";

export class CartModel {
  static createCartDoc = withErrorHandling(async (payload: NewCartDoc) => {
    const { user_id, product_id, qty } = payload;

    const { rows } = await query(
      `INSERT INTO cart_items (user_id, product_id, quantity, created_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (user_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                     updated_at = NOW()
       RETURNING *`,
      [user_id, product_id, qty],
    );

    return rows[0];
  });

  static deleteCartDoc = withErrorHandling(
    async (payload: { id: string; user_id: string }) => {
      const { id, user_id } = payload;

      const { rowCount } = await query(
        `DELETE FROM cart_items WHERE id = $1 AND user_id = $2`,
        [id, user_id],
      );

      return rowCount;
    },
  );

  static updateCartDoc = withErrorHandling(
    async (payload: { cart_id: string; qty: number; user_id: string }) => {
      const { cart_id, qty, user_id } = payload;

      const { rows } = await query(
        `UPDATE cart_items
         SET quantity = $1, updated_at = NOW()
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [qty, cart_id, user_id],
      );

      return rows[0];
    },
  );

  static getAllCartDoc = withErrorHandling(async (payload: { id: string }) => {
    const { rows } = await query(
      `SELECT
         c.id,
         c.user_id,
         c.product_id,
         c.quantity,
         p.name,
         p.price,
         p.thumbnail_url,
         p.stock
       FROM cart_items AS c
       INNER JOIN products AS p ON p.id = c.product_id
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC`,
      [payload.id],
    );

    return rows;
  });
}
