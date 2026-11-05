import { db, query } from "../database";
import { withErrorHandling } from "../utils/errHandler";

const CREATE_TABLE = `
    CREATE TABLE IF NOT EXISTS package_bookings (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        package_id INT NOT NULL REFERENCES packages(id) ON DELETE RESTRICT,
        scheduled_at TIMESTAMPTZ,
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        status VARCHAR(20) NOT NULL DEFAULT 'pending'
            CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
        payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
            CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
`;

export class PackageBookingModel {
  static ensureTable = withErrorHandling(async () => {
    await query(CREATE_TABLE);
  });

  static createPackageBookingDoc = withErrorHandling(async (payload: {
    user_id: string;
    package_id: string;
    notes?: string | null;
  }) => {
    await PackageBookingModel.ensureTable();
    const { user_id, package_id, notes = null } = payload;
    const client = await db();
    try {
      await client.query("BEGIN");
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        [user_id, "customer-package-bookings"],
      );
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))",
        [user_id, `package:${package_id}`],
      );
      const existing = await client.query(
        `SELECT *
         FROM package_bookings
         WHERE user_id = $1 AND package_id = $2
           AND status IN ('pending', 'confirmed')
         ORDER BY id DESC
         LIMIT 1`,
        [user_id, package_id],
      );
      if (existing.rows[0]) {
        await client.query("COMMIT");
        return existing.rows[0];
      }
      const { rows } = await client.query(
        `INSERT INTO package_bookings (user_id, package_id, price, notes)
         SELECT $1, p.id, p.price, $3
         FROM packages p
         WHERE p.id = $2 AND COALESCE(p.is_active, TRUE) = TRUE
         RETURNING *`,
        [user_id, package_id, notes],
      );
      await client.query("COMMIT");
      return rows[0] ?? null;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  });

  static getAllPackageBookingDocs = withErrorHandling(async (payload: { user_id: string }) => {
    await PackageBookingModel.ensureTable();
    const { rows } = await query(
      `SELECT
         pb.id,
         pb.user_id,
         pb.package_id,
         pb.scheduled_at,
         pb.price,
         pb.status,
         pb.payment_status,
         pb.notes,
         pb.created_at,
         pb.updated_at,
         p.name,
         p.description,
         p.duration_months,
         p.includes,
         p.image_url
       FROM package_bookings pb
       INNER JOIN packages p ON p.id = pb.package_id
       WHERE pb.user_id = $1
       ORDER BY pb.scheduled_at DESC NULLS LAST, pb.id DESC`,
      [payload.user_id],
    );
    return rows;
  });

  static deletePackageBookingDoc = withErrorHandling(async (payload: { id: string; user_id: string }) => {
    await PackageBookingModel.ensureTable();
    const { rowCount } = await query(
      `DELETE FROM package_bookings WHERE id = $1 AND user_id = $2 AND status = 'pending'`,
      [payload.id, payload.user_id],
    );
    return rowCount;
  });
}
