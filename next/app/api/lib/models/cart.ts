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

    static createCartDoc = withErrorHandling(
        async (payload: NewCartDoc) => {
            const {
                user_id, product_id, qty
            } = payload;
            const columns = ["user_id", "product_id", "quantity", "created_at"];
            const values = [user_id, product_id, qty, new Date()];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO cart_items (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteCartDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM cart_items WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    )

    static updateCartDoc = withErrorHandling(
        async (payload: Omit<NewCartDoc, "user_id"> & { cart_id: string }) => {
            const {
                cart_id, qty
            } = payload;

            const { rows } = await query(
                `UPDATE cart_items SET quantity=$1, updated_at=NOW()  WHERE id = $2 RETURNING *`,
                [qty, cart_id]
            );

            return rows;
        }
    );

    static getAllCartDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `
                    SELECT 
                        c.id AS id,
                        c.user_id,
                        c.product_id,
                        c.quantity,

                        p.id AS product_id,
                        p.name,
                        p.price,
                        p.thumbnail_url,
                        p.stock
                    FROM cart_items AS c
                    LEFT JOIN products AS p
                        ON c.product_id = p.id
                    WHERE c.user_id = $1;
                `, [id]
            );
            return rows;
        }
    )

}