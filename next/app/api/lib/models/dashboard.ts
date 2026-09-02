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
            
                    COUNT(*) FILTER (
                        WHERE order_type = 'product'
                    ) AS products,
            
                    COUNT(*) FILTER (
                        WHERE order_type = 'service'
                    ) AS services,
            
                    COUNT(*) FILTER (
                        WHERE order_type = 'appointment'
                    ) AS appointments
            
                FROM orders
                WHERE payment_status = 'paid';
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
                     FROM consultation_offerings
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
                catalogue,
                operations
            };

        }
    );
}