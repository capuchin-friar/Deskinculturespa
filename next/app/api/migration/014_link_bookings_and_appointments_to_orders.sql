ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS order_id BIGINT UNIQUE REFERENCES orders(id) ON DELETE RESTRICT;

ALTER TABLE appointments
    ADD COLUMN IF NOT EXISTS order_id BIGINT UNIQUE REFERENCES orders(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS idx_bookings_order_id ON bookings(order_id);
CREATE INDEX IF NOT EXISTS idx_appointments_order_id ON appointments(order_id);
