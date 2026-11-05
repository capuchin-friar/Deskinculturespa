/**
 * Database operations for spa packages sold at a set price
 * for a period of time, with a list of included offerings.
 *
 * @module app/api/shared/models/package
 */

import { query } from "../database";
import type { NewPackageDoc } from "../types/admin";
import { withErrorHandling } from "../utils/errHandler";

function asIncludes(value: unknown): string[] {
    if (typeof value === "string") {
        try {
            return asIncludes(JSON.parse(value));
        } catch {
            return value.trim() ? [value.trim()] : [];
        }
    }
    if (!Array.isArray(value)) return [];
    return value
        .map((entry) => String(entry || "").replace(/\u2060/g, "").trim())
        .filter(Boolean);
}

export function formatPackageRow(row: Record<string, unknown> | null | undefined) {
    if (!row) return null;
    const durationMonths = Number(row.duration_months) || 0;
    const image = String(row.image_url || "").trim();
    return {
        ...row,
        includes: asIncludes(row.includes),
        duration_months: durationMonths,
        duration: durationMonths > 0
            ? `${durationMonths} month${durationMonths === 1 ? "" : "s"}`
            : "",
        thumbnail_url: image || "/spa.png",
        image_url: image || "/spa.png",
    };
}

const CREATE_PACKAGES_TABLE = `
    CREATE TABLE IF NOT EXISTS packages (
        id SERIAL PRIMARY KEY,
        admin_id BIGINT NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
        duration_months INTEGER NOT NULL CHECK (duration_months > 0),
        includes JSONB NOT NULL DEFAULT '[]'::jsonb,
        image_url TEXT,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        FOREIGN KEY (admin_id) REFERENCES users(id)
    )
`;

export class PackageModel {
    static ensureTable = withErrorHandling(async () => {
        await query(CREATE_PACKAGES_TABLE);
        await query(`ALTER TABLE packages DROP COLUMN IF EXISTS service_ids`);
        await query(`ALTER TABLE packages DROP COLUMN IF EXISTS appointment_ids`);
    });

    static createPackageDoc = withErrorHandling(
        async (payload: NewPackageDoc) => {
            await PackageModel.ensureTable();
            const {
                admin_id,
                name,
                description,
                price,
                duration_months,
                includes,
                image_url,
            } = payload;

            const sql = `
                INSERT INTO packages (
                    admin_id, name, description, price, duration_months,
                    includes, image_url, created_at
                )
                VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, NOW())
                RETURNING *
            `;

            const { rows } = await query(sql, [
                admin_id,
                name,
                description,
                price,
                duration_months,
                JSON.stringify(asIncludes(includes)),
                image_url,
            ]);

            return rows[0];
        },
    );

    static deletePackageDoc = withErrorHandling(
        async (payload: { id: string | number }) => {
            await PackageModel.ensureTable();
            const { rowCount } = await query(
                `DELETE FROM packages WHERE id = $1`,
                [payload.id],
            );
            return rowCount;
        },
    );

    static getAllPackageDoc = withErrorHandling(
        async () => {
            await PackageModel.ensureTable();
            const { rows } = await query(
                `SELECT * FROM packages ORDER BY created_at DESC, id DESC`,
            );
            return rows.map((row) => formatPackageRow(row)).filter(Boolean);
        },
    );

    static getActivePackageDoc = withErrorHandling(
        async () => {
            await PackageModel.ensureTable();
            const { rows } = await query(
                `SELECT * FROM packages
                 WHERE COALESCE(is_active, TRUE) = TRUE
                 ORDER BY created_at DESC, id DESC`,
            );
            return rows.map((row) => formatPackageRow(row)).filter(Boolean);
        },
    );

    static getPackageDoc = withErrorHandling(
        async (payload: { id: string | number }) => {
            await PackageModel.ensureTable();
            const { rows } = await query(
                `SELECT * FROM packages
                 WHERE id::text = $1
                   AND COALESCE(is_active, TRUE) = TRUE
                 LIMIT 1`,
                [String(payload.id)],
            );
            return formatPackageRow(rows[0]);
        },
    );
}
