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
);

CREATE INDEX IF NOT EXISTS idx_package_bookings_user_id ON package_bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_package_id ON package_bookings(package_id);
CREATE INDEX IF NOT EXISTS idx_package_bookings_scheduled_at ON package_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_package_bookings_status ON package_bookings(status);
