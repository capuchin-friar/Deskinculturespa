/**
 * 
 * Hamdles all database operation related to products
 * - Products Creation
 * - Product Deletion
 * - Product Editing
 * 
 * @module app/api/lib/models/product
 */


import { query } from "../database";
import type { NewProductDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class ProductModel {

    static createProductDoc = withErrorHandling(
        async (payload: NewProductDoc) => {
            const {
                admin_id, name, description,
                category, subcategory, brand, images, thumbnail_url, specifications
            } = payload;
            const columns = ["admin_id", "name", "description", "category", "subcategory", "brand", "images", "thumbnail_url", "specifications", "status", "created_at"];
            const values = [admin_id, name, description,
                category, subcategory, brand, (images), thumbnail_url, specifications, "active", new Date()];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO products (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteProductDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM products WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    )

    static updateProductDoc = withErrorHandling(
        async (payload: Omit<NewProductDoc, "admin_id"> & { product_id: string }) => {
            const {
                product_id, name, description,
                category, subcategory, brand, images, thumbnail_url, specifications,
            } = payload;

            const { rows } = await query(
                `UPDATE products SET name=$1, description=$2, category=$3, subcategory=$4, brand=$5, images=$6, thumbnail_url=$7, specifications=$8, updated_at=NOW()  WHERE id = $9 RETURNING *`,
                [name, description, category, subcategory, brand, images, thumbnail_url, specifications, product_id]
            );

            return rows;
        }
    )

}