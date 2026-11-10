import { query } from "../database";
import { withErrorHandling } from "../utils/errHandler";
import { PackageBookingModel } from "./packageBooking";

export type SlotKind = "booking" | "consultation" | "package";

const KIND_FILTERS: Record<string, SlotKind | "all"> = {
    all: "all",
    booking: "booking",
    bookings: "booking",
    service: "booking",
    services: "booking",
    consultation: "consultation",
    consultations: "consultation",
    appointment: "consultation",
    appointments: "consultation",
    package: "package",
    packages: "package",
};

function slotUnion(kind: SlotKind | "all") {
    const bookingSql = `
        SELECT
            'booking'::text AS kind,
            b.id,
            COALESCE(NULLIF(s.subcategory, ''), s.category, 'Service') AS title,
            TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
            b.scheduled_at,
            COALESCE(s.duration_minutes, 60) AS duration_minutes,
            b.status,
            s.image_url
        FROM bookings b
        INNER JOIN services s ON s.id = b.service_id
        LEFT JOIN users u ON u.id = b.user_id
        WHERE b.scheduled_at IS NOT NULL
          AND b.status IS DISTINCT FROM 'cancelled'
          AND b.scheduled_at >= $1
          AND b.scheduled_at < $2
    `;

    const consultationSql = `
        SELECT
            'consultation'::text AS kind,
            a.id,
            COALESCE(
                NULLIF(a.consultation_name, ''),
                NULLIF(c.slug, ''),
                c.mode::text,
                'Consultation'
            ) AS title,
            TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
            COALESCE(
                a.scheduled_at,
                CASE
                    WHEN a.appointment_date IS NOT NULL AND a.start_time IS NOT NULL
                    THEN (a.appointment_date + a.start_time) AT TIME ZONE 'Africa/Lagos'
                    ELSE NULL
                END
            ) AS scheduled_at,
            COALESCE(c.duration_minutes, 30) AS duration_minutes,
            a.status::text,
            c.thumbnail_url AS image_url
        FROM appointments a
        LEFT JOIN consultations c ON c.id = a.offering_id
        LEFT JOIN users u ON u.id = a.customer_id
        WHERE COALESCE(a.status::text, '') IS DISTINCT FROM 'cancelled'
          AND COALESCE(
                a.scheduled_at,
                CASE
                    WHEN a.appointment_date IS NOT NULL AND a.start_time IS NOT NULL
                    THEN (a.appointment_date + a.start_time) AT TIME ZONE 'Africa/Lagos'
                    ELSE NULL
                END
            ) IS NOT NULL
          AND COALESCE(
                a.scheduled_at,
                (a.appointment_date + a.start_time) AT TIME ZONE 'Africa/Lagos'
            ) >= $1
          AND COALESCE(
                a.scheduled_at,
                (a.appointment_date + a.start_time) AT TIME ZONE 'Africa/Lagos'
            ) < $2
    `;

    const packageSql = `
        SELECT
            'package'::text AS kind,
            pb.id,
            COALESCE(NULLIF(p.name, ''), 'Package') AS title,
            TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
            pb.scheduled_at,
            60 AS duration_minutes,
            pb.status,
            p.image_url
        FROM package_bookings pb
        LEFT JOIN packages p ON p.id = pb.package_id
        LEFT JOIN users u ON u.id = pb.user_id
        WHERE pb.scheduled_at IS NOT NULL
          AND pb.status IS DISTINCT FROM 'cancelled'
          AND pb.scheduled_at >= $1
          AND pb.scheduled_at < $2
    `;

    if (kind === "booking") return bookingSql;
    if (kind === "consultation") return consultationSql;
    if (kind === "package") return packageSql;
    return `${bookingSql} UNION ALL ${consultationSql} UNION ALL ${packageSql}`;
}

export class SlotModel {
    static getAdminSlots = withErrorHandling(
        async (payload: { kind?: string; from: string | Date; to: string | Date }) => {
            await PackageBookingModel.ensureTable();
            const kind = KIND_FILTERS[String(payload.kind || "all").toLowerCase()] || "all";
            const sql = `
                SELECT
                    kind,
                    id,
                    title,
                    customer,
                    scheduled_at,
                    duration_minutes,
                    status,
                    image_url,
                    to_char(scheduled_at AT TIME ZONE 'Africa/Lagos', 'YYYY-MM-DD') AS slot_date,
                    to_char(scheduled_at AT TIME ZONE 'Africa/Lagos', 'HH24:MI') AS slot_time
                FROM (
                    ${slotUnion(kind)}
                ) slots
                ORDER BY scheduled_at ASC, title ASC, id ASC
            `;
            const { rows } = await query(sql, [payload.from, payload.to]);
            return rows;
        },
    );
}
