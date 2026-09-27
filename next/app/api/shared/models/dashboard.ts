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
                    ) AS paid_bookings
                FROM bookings;
            `);

            const { rows: [appointmentBreakdown = {}] } = await query(`
                SELECT
                    COUNT(*) AS total_appointments,
                    COUNT(*) FILTER (
                        WHERE payment_status = 'paid'
                    ) AS paid_appointments
                FROM appointments;
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
                        WHERE appointment_date >= NOW()
                    ) AS upcoming,
            
                    COUNT(*) FILTER (
                        WHERE appointment_date < NOW()
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
                operations
            };

        }
    );
}
