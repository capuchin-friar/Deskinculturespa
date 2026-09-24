/**
 *
 * Hamdles all database operation related to carts
 * - Carts Creation
 * - Cart Deletion
 * - Cart Editing
 *
 * @module app/api/lib/models/cart
 */

import { query } from "../database";
import type { NewCartDoc } from "../types/user";
import { withErrorHandling } from "../utils/errHandler";

export class CartModel {
  static createCartDoc = withErrorHandling(async (payload: NewCartDoc) => {
    const { user_id, product_id, qty, type } = payload;
    const columns = ["user_id", "product_id", "quantity", "type", "created_at"];
    const values = [user_id, product_id, qty, type, new Date()];
    const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

    const sql = `INSERT INTO cart_items (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
    const { rows } = await query(sql, values);

    return rows[0];
  });

  static deleteCartDoc = withErrorHandling(
    async (payload: { id: string; type: string }) => {
      const { id, type } = payload;

      const { rowCount } = await query(
        `DELETE FROM cart_items WHERE id = $1 AND type = $2`,
        [id, type],
      );

      return rowCount;
    },
  );

  static updateCartDoc = withErrorHandling(
    async (payload: Omit<NewCartDoc, "user_id"> & { cart_id: string }) => {
      const { cart_id, qty, type } = payload;

      const { rows } = await query(
        `UPDATE cart_items SET quantity=$1, updated_at=NOW()  WHERE id = $2 AND type = $3 RETURNING *`,
        [qty, cart_id, type],
      );

      return rows;
    },
  );
  static getAllCartDoc = withErrorHandling(async (payload: { id: string }) => {
    const { id } = payload;

    const { rows } = await query(
      `
        SELECT
          c.id,
          c.user_id,
          c.type,
          c.product_id,
          c.quantity,

          CASE
            WHEN c.type = 'product' THEN p.id
            WHEN c.type = 'service' THEN s.id
            WHEN c.type = 'consultation' THEN a.id
          END AS item_id,

          CASE
            WHEN c.type = 'product' THEN p.name
            WHEN c.type = 'service' THEN s.subcategory
            WHEN c.type = 'consultation' THEN a.slug
          END AS name,

          CASE
            WHEN c.type = 'product' THEN p.price
            WHEN c.type = 'service' THEN s.price
            WHEN c.type = 'consultation' THEN a.price
          END AS price,

          CASE
            WHEN c.type = 'product' THEN p.thumbnail_url
            WHEN c.type = 'service' THEN s.image_url
            WHEN c.type = 'consultation' THEN a.thumbnail_url
          END AS thumbnail_url,

          CASE
            WHEN c.type = 'product' THEN p.stock
            ELSE NULL
          END AS stock

        FROM cart_items AS c

        LEFT JOIN products AS p
          ON c.product_id = p.id
          AND c.type = 'product'

        LEFT JOIN services AS s
          ON c.product_id = s.id
          AND c.type = 'service'

        LEFT JOIN consultations AS a
          ON c.product_id = a.id
          AND c.type = 'consultation'

        WHERE c.user_id = $1;
      `,
      [id],
    );
    console.log(rows)
    return rows;
  });
}
