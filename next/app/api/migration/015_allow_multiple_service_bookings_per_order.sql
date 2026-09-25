ALTER TABLE bookings
    DROP CONSTRAINT IF EXISTS bookings_order_id_key;

CREATE INDEX IF NOT EXISTS idx_bookings_order_id ON bookings(order_id);
