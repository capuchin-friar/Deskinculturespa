/**
 * 
 * Hamdles all database operation related to blogs
 * - Blogs Creation
 * - Blog Deletion
 * - Blog Editing
 * 
 * @module app/api/lib/models/blog
 */


import { query } from "../database";
import type { NewBlogDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class BlogModel {

    static createBlogDoc = withErrorHandling(
        async (payload: NewBlogDoc) => {
            const { admin_id, title, summary, content, image_urls, thumbnail_url, category } = payload;
            const columns = ["admin_id", "title", "summary", "content", "image_urls", "thumbnail_url", "category", "status", "created_at"];
            const values = [admin_id, title, summary, content, image_urls, thumbnail_url, category, "published", new Date()];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO blogs (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteBlogDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM blogs WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    )

    static updateBlogDoc = withErrorHandling(
        async (payload: Omit<NewBlogDoc, "admin_id"> & { blog_id: string }) => {
            const { title, summary, content, image_urls, thumbnail_url, category, blog_id } = payload;

            const { rows } = await query(
                `UPDATE blogs SET title=$1, summary=$2, content=$3, image_urls=$4, thumbnail_url=$5, category=$6, updated_at=NOW()  WHERE id = $7 RETURNING *`,
                [title, summary, content, image_urls, thumbnail_url, category, blog_id]
            );

            return rows;
        }
    );

    static getAllBlogtDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `SELECT * FROM blogs WHERE admin_id = $1`,
                [id]
            );

            return rows;
        }
    );

}