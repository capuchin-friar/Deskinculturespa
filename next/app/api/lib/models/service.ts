/**
 * 
 * Hamdles all database operation related to services
 * - Services Creation
 * - Service Deletion
 * - Service Editing
 * 
 * @module app/api/lib/models/service
 */


import { query } from "../database";
import type { NewServiceDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class ServiceModel {

    static createServiceDoc = withErrorHandling(
        async (payload: NewServiceDoc) => {
            const {
                admin_id, name, description, price, duration_minutes, image_url
            } = payload;
            const columns = ["admin_id", "name", "description", "price", "duration_minutes", "image_url", "created_at"];
            const values = [admin_id, name, description, price, duration_minutes, image_url, new Date()];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO services (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteServiceDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM services WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    )

    static updateServiceDoc = withErrorHandling(
        async (payload: Omit<NewServiceDoc, "admin_id"> & { service_id: string }) => {
            const {
                service_id, name, description, price, duration_minutes, image_url
            } = payload;

            const { rows } = await query(
                `UPDATE services SET name=$1, description=$2, price=$3, duration_minutes=$4, image_url=$5, updated_at=NOW()  WHERE id = $6 RETURNING *`,
                [name, description, price, duration_minutes, image_url, service_id]
            );

            return rows;
        }
    );

    static getAllServiceDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `SELECT * FROM services WHERE admin_id = $1`,
                [id]
            );

            return rows;
        }
    )

}