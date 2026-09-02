/**
 * 
 * Hamdles all database operation related to appointments
 * - Appointments Creation
 * - Appointment Deletion
 * - Appointment Editing
 * 
 * @module app/api/lib/models/appointment
 */


import { query } from "../database";
import type { NewAppointmentDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

export class AppointmentModel {

    static createAppointmentDoc = withErrorHandling(
        async (payload: NewAppointmentDoc) => {
            const {
                admin_id, mode, price, duration_minutes
            } = payload;
            const columns = ["consultant_id", "mode", "duration_minutes", "price", "is_active", "created_at"];
            const values = [admin_id, mode, duration_minutes, price, true, new Date()];
            const placeholders = values.map((_, i) => `$${i + 1}`).join(",");

            const sql = `INSERT INTO consultation_offerings (${columns.join(",")}) VALUES (${placeholders}) RETURNING *`;
            const { rows } = await query(sql, values);

            return rows[0];
        }
    );

    static deleteAppointmentDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;

            const { rowCount } = await query(
                `DELETE FROM consultation_offerings WHERE id = $1`,
                [id]
            );

            return rowCount;
        }
    );

    static updateAppointmentDoc = withErrorHandling(
        async (payload: Omit<NewAppointmentDoc, "admin_id"> & { appointment_id: string }) => {
            const {
                appointment_id, mode, price, duration_minutes
            } = payload;

            const { rows } = await query(
                `UPDATE consultation_offerings SET mode=$1, duration_minutes=$2, price=$3, is_active=$4, updated_at=NOW()  WHERE id = $5 RETURNING *`,
                [mode, duration_minutes, price, true, appointment_id]
            );

            return rows;
        }
    );

    static getAllAppointmentDoc = withErrorHandling(
        async (payload: { id: string }) => {
            const {
                id
            } = payload;
            const { rows } = await query(
                `SELECT * FROM consultation_offerings WHERE consultant_id = $1`,
                [id]
            );

            return rows;
        }
    );

}