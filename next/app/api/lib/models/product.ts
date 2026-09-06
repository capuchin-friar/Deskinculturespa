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
                admin_id, name, price, description,
                category, subcategory, brand, images, thumbnail_url, specifications
            } = payload;
            console.log("price: ", price)
            const columns = ["admin_id", "name",  "price", "description", "category", "subcategory", "brand", "images", "thumbnail_url", "specifications", "status", "created_at"];
            const values = [admin_id, name, price, description, 
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
                product_id, name, price, description,
                category, subcategory, brand, images, thumbnail_url, specifications,
            } = payload;

            const { rows } = await query(
                `UPDATE products SET name=$1, price=$2, description=$3, category=$4, subcategory=$5, brand=$6, images=$7, thumbnail_url=$8, specifications=$9, updated_at=NOW()  WHERE id = $10 RETURNING *`,
                [name, price, description, category, subcategory, brand, images, thumbnail_url, specifications, product_id]
            );

            return rows;
        }
    );

    static getAllProducttDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `SELECT * FROM products WHERE admin_id = $1`,
                [id]
            );

            return rows;
        }
    )

}