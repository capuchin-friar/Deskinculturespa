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
                admin_id, description, price, duration_minutes, specifications, image_url, service, sub_service
            } = payload;
            const columns = ["admin_id", "description", "category", "subcategory", "price", "duration_minutes", "specifications", "image_url", "created_at"];
            const values = [admin_id, description, service, sub_service, price, duration_minutes, specifications, image_url,  new Date()];
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
                service_id, description, price, duration_minutes, service, sub_service,  specifications, image_url
            } = payload;

            const { rows } = await query(
                `UPDATE services SET description=$1, category=$2, subcategory=$3, price=$4, duration_minutes=$5, specifications=$6, image_url=$7, updated_at=NOW()  WHERE id = $8 RETURNING *`,
                [description, service, sub_service, price, duration_minutes, specifications, image_url, service_id]
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

    static _getAllServiceDoc = withErrorHandling(
        async () => {
           
            const { rows } = await query(
                `SELECT * FROM services`
            );

            return rows;
        }
    )

}