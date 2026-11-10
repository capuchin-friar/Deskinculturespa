import { db, query } from "../database";
import { resolveAppointmentType } from "@/src/utils/appointmentTypes";
import { AppointmentModel } from "./appointment";

function formatOffer(row: Record<string, unknown>) {
  const type = resolveAppointmentType(row.slug);
  return {
    ...row,
    id: row.id,
    type: type?.id || null,
    type_name: type?.name || null,
    description: row.description || "",
    thumbnail_url: row.thumbnail_url || null,
  };
}

export class ConsultationBookingModel {
  static async getActiveOffers() {
    await AppointmentModel.ensureSchema();
    const { rows } = await query(
      `SELECT id, slug, consultant_id, mode, duration_minutes, price, thumbnail_url, description, is_active
       FROM consultations
       WHERE COALESCE(is_active, TRUE) = TRUE
       ORDER BY duration_minutes, price, id`,
    );
    return rows.map((row) => formatOffer(row));
  }

  static getOffers(slugs: string[]) {
    const wanted = new Set(
      (slugs || [])
        .map((slug) => resolveAppointmentType(slug)?.id)
        .filter(Boolean),
    );
    return ConsultationBookingModel.getActiveOffers().then((rows) =>
      rows.filter((row) => row.type && wanted.has(row.type)),
    );
  }

  static getCustomerAppointments(customerId: string) {
    return query(
      `SELECT a.id, a.customer_id, a.consultant_id, a.offering_id, a.appointment_date,
              a.start_time, a.end_time, a.scheduled_at, a.amount, a.status,
              a.payment_status, a.notes, a.consultation_name, a.created_at,
              c.slug, c.mode, c.duration_minutes, c.thumbnail_url, c.description
       FROM appointments a
       JOIN consultations c ON c.id = a.offering_id
       WHERE a.customer_id = $1
       ORDER BY a.scheduled_at DESC NULLS LAST, a.id DESC`,
      [customerId],
    ).then(({ rows }) => rows);
  }

  static async createCustomerAppointment({
    customerId,
    offeringId,
    slugs,
    consultationName,
  }: { customerId: string; offeringId: number; slugs: string[]; consultationName: string }) {
    const client = await db();
    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))", [customerId, "customer-bookings"]);
      const existing = await client.query(
        `SELECT * FROM appointments
         WHERE customer_id = $1 AND offering_id = $2 AND status IN ('pending', 'confirmed')
         ORDER BY id DESC LIMIT 1`,
        [customerId, offeringId],
      );
      if (existing.rows[0]) {
        await client.query("COMMIT");
        return existing.rows[0];
      }
      const { rows } = await client.query(
        `INSERT INTO appointments (customer_id, consultant_id, offering_id, amount, consultation_name)
         SELECT $1, c.consultant_id, c.id, c.price, $3
         FROM consultations c
         WHERE c.id = $2 AND c.slug = ANY($4::text[]) AND c.is_active = TRUE
         RETURNING *`,
        [customerId, offeringId, consultationName, slugs],
      );
      await client.query("COMMIT");
      return rows[0] ?? null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async deleteCustomerAppointment(id: string, customerId: string) {
    const { rowCount } = await query(
      `DELETE FROM appointments
       WHERE id = $1 AND customer_id = $2 AND status = 'pending'`,
      [id, customerId],
    );
    return rowCount;
  }
}
