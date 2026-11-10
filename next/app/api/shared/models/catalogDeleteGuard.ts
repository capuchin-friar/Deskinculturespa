import { query } from "../database";
import { PackageBookingModel } from "./packageBooking";

export type CatalogDeleteKind = "product" | "service" | "appointment" | "package";

const PAID_CHECKS: Record<CatalogDeleteKind, string> = {
    product: `
        SELECT 1
        FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.item_id = $1
          AND LOWER(o.payment_status) = 'paid'
        LIMIT 1
    `,
    service: `
        SELECT 1
        FROM bookings
        WHERE service_id::text = $1
          AND LOWER(payment_status) = 'paid'
        LIMIT 1
    `,
    appointment: `
        SELECT 1
        FROM appointments
        WHERE offering_id::text = $1
          AND LOWER(payment_status::text) = 'paid'
        LIMIT 1
    `,
    package: `
        SELECT 1
        FROM package_bookings
        WHERE package_id::text = $1
          AND LOWER(payment_status) = 'paid'
        LIMIT 1
    `,
};

const PAID_MESSAGES: Record<CatalogDeleteKind, string> = {
    product: "This product cannot be deleted because it has already been paid for.",
    service: "This service cannot be deleted because it has already been paid for.",
    appointment: "This appointment cannot be deleted because it has already been paid for.",
    package: "This package cannot be deleted because it has already been paid for.",
};

export async function catalogItemHasPaidPurchase(
    kind: CatalogDeleteKind,
    id: string | number,
) {
    if (kind === "package") {
        await PackageBookingModel.ensureTable();
    }
    const { rows } = await query(PAID_CHECKS[kind], [String(id)]);
    return rows.length > 0;
}

export function paidCatalogItemMessage(kind: CatalogDeleteKind) {
    return PAID_MESSAGES[kind];
}
