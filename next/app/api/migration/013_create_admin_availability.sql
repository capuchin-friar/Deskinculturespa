CREATE TABLE admin_weekly_availability (
    id SERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_interval_minutes INTEGER NOT NULL CHECK (slot_interval_minutes BETWEEN 5 AND 240),
    timezone TEXT NOT NULL DEFAULT 'Africa/Lagos',
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (admin_id, day_of_week),
    CHECK (end_time > start_time)
);

CREATE INDEX idx_admin_weekly_availability_admin_day
    ON admin_weekly_availability (admin_id, day_of_week);
