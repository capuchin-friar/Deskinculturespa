/**
 * 
 * Hamdles all database operation related to appointments
 * - Appointments Creation
 * - Appointment Deletion
 * - Appointment Editing
 * 
 * @module app/api/shared/models/appointment
 */


import { query } from "../database";
import type { NewAppointmentDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class AppointmentModel {

    static ensureSchema = withErrorHandling(async () => {
        await query(`ALTER TABLE consultations ALTER COLUMN thumbnail_url TYPE TEXT`);
        await query(`ALTER TABLE consultations ALTER COLUMN slug TYPE TEXT`);
        await query(`ALTER TABLE consultations ADD COLUMN IF NOT EXISTS description TEXT`);
    });

    static createAppointmentDoc = withErrorHandling(
        async (payload: NewAppointmentDoc) => {
            await AppointmentModel.ensureSchema();
            const {
                admin_id, mode, price, duration_minutes, slug, thumbnail_url, description
            } = payload;
            const columns = [
                "consultant_id",
                "slug",
                "thumbnail_url",
                "mode",
                "duration_minutes",
                "price",
                "description",
                "is_active",
                "created_at",
            ];
            const values = [
                admin_id,
                slug,
                thumbnail_url,
                mode,
                duration_minutes,
                price,
                description || null,
                true,
                new Date(),
            ];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO consultations (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteAppointmentDoc = withErrorHandling(
        async (payload: { id: string | number }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM consultations WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    );

    static updateAppointmentDoc = withErrorHandling(
        async (payload: {
            appointment_id: string;
            mode: string;
            price: number;
            duration_minutes: number;
        }) => {
            const {
                appointment_id, mode, price, duration_minutes
            } = payload;

            const { rows } = await query(
                `UPDATE consultations SET mode=$1, duration_minutes=$2, price=$3, is_active=$4, updated_at=NOW()  WHERE id = $5 RETURNING *`,
                [mode, duration_minutes, price, true, appointment_id]
            );

            return rows[0];
        }
    );

    static getAllAppointmentDoc = withErrorHandling(
        async (payload: { id: string | number }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `SELECT * FROM consultations ORDER BY created_at DESC, id DESC`
            );

            return rows;
        }
    );

}
