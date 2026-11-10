import { query } from "../database";
import { withErrorHandling } from "../utils/errHandler";

export class DashboardModel {

    static getDashboardDoc = withErrorHandling(
        async () => {

            const { rows: [overview = {}] } = await query(`
                SELECT
                    (SELECT COUNT(*)
                     FROM users
                     WHERE role = 'customer') AS customers,
            
                    (SELECT COUNT(*)
                     FROM orders
                     WHERE payment_status = 'paid') AS orders,
            
                    (SELECT COALESCE(SUM(total_paid), 0)
                     FROM orders
                     WHERE payment_status = 'paid') AS revenue
            `);

            const { rows: [orderBreakdown = {}] } = await query(`
                SELECT
                    COUNT(*) AS total_orders,
                    COUNT(*) AS products
                FROM orders
                WHERE payment_status = 'paid';
            `);

            const { rows: [bookingBreakdown = {}] } = await query(`
                SELECT
                    COUNT(*) AS total_bookings,
                    COUNT(*) FILTER (
                        WHERE payment_status = 'paid'
                    ) AS paid_bookings,
                    COALESCE(SUM(price) FILTER (
                        WHERE payment_status = 'paid'
                    ), 0) AS paid_revenue
                FROM bookings;
            `);

            const { rows: [appointmentBreakdown = {}] } = await query(`
                SELECT
                    COUNT(*) AS total_appointments,
                    COUNT(*) FILTER (
                        WHERE payment_status = 'paid'
                    ) AS paid_appointments,
                    COALESCE(SUM(amount) FILTER (
                        WHERE payment_status = 'paid'
                    ), 0) AS paid_revenue
                FROM appointments;
            `);

            const { rows: recentActivity } = await query(`
                SELECT kind, id, title, amount, status, customer, created_at, scheduled_at, image_url
                FROM (
                    SELECT
                        'product'::text AS kind,
                        o.id,
                        COALESCE((
                            SELECT COALESCE(p.name, 'Product')
                            FROM order_items oi
                            LEFT JOIN products p ON p.id::text = oi.item_id
                            WHERE oi.order_id = o.id
                            ORDER BY oi.id
                            LIMIT 1
                        ), 'Product order') AS title,
                        o.total_paid AS amount,
                        o.payment_status AS status,
                        TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')) AS customer,
                        o.created_at::timestamptz,
                        NULL::timestamptz AS scheduled_at,
                        (
                            SELECT p.thumbnail_url
                            FROM order_items oi
                            LEFT JOIN products p ON p.id::text = oi.item_id
                            WHERE oi.order_id = o.id
                            ORDER BY oi.id
                            LIMIT 1
                        ) AS image_url
                    FROM orders o
                    LEFT JOIN users u ON u.id::text = o.customer_id

                    UNION ALL

                    SELECT
                        'service',
                        b.id,
                        COALESCE(NULLIF(s.subcategory, ''), s.category, 'Service'),
                        b.price,
                        b.payment_status,
                        TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')),
                        b.created_at,
                        b.scheduled_at,
                        s.image_url
                    FROM bookings b
                    INNER JOIN services s ON s.id = b.service_id
                    LEFT JOIN users u ON u.id = b.user_id

                    UNION ALL

                    SELECT
                        'appointment',
                        a.id,
                        COALESCE(NULLIF(a.consultation_name, ''), c.mode::text, 'Consultation'),
                        a.amount,
                        a.payment_status::text,
                        TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')),
                        a.created_at,
                        a.scheduled_at,
                        c.thumbnail_url
                    FROM appointments a
                    LEFT JOIN consultations c ON c.id = a.offering_id
                    LEFT JOIN users u ON u.id = a.customer_id

                    UNION ALL

                    SELECT
                        'package',
                        pb.id,
                        COALESCE(NULLIF(p.name, ''), 'Package'),
                        pb.price,
                        pb.payment_status,
                        TRIM(BOTH FROM COALESCE(u.fname, '') || ' ' || COALESCE(u.lname, '')),
                        pb.created_at,
                        pb.scheduled_at,
                        p.image_url
                    FROM package_bookings pb
                    LEFT JOIN packages p ON p.id = pb.package_id
                    LEFT JOIN users u ON u.id = pb.user_id
                ) activity
                ORDER BY created_at DESC
                LIMIT 12
            `);

            const { rows: [catalogue = {}] } = await query(`
                SELECT
                    (SELECT COUNT(*)
                     FROM products
                     WHERE is_published = true) AS products,
            
                    (SELECT COUNT(*)
                     FROM services
                     WHERE is_active = true) AS services,

                    (SELECT COUNT(*)
                     FROM consultations
                     WHERE is_active = true) AS appoinment_offerings;
            `);

            const { rows: [operations = {}] } = await query(`
                SELECT
                    COUNT(*) FILTER (
                        WHERE COALESCE(scheduled_at, (appointment_date + start_time) AT TIME ZONE 'Africa/Lagos') >= NOW()
                    ) AS upcoming,
            
                    COUNT(*) FILTER (
                        WHERE COALESCE(scheduled_at, (appointment_date + start_time) AT TIME ZONE 'Africa/Lagos') < NOW()
                    ) AS completed
            
                FROM appointments
                WHERE payment_status = 'paid';
            `);

            return {
                overview,
                orderBreakdown,
                bookingBreakdown,
                appointmentBreakdown,
                catalogue,
                operations,
                recentActivity,
            };

        }
    );
}
