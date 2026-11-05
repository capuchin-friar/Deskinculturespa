CREATE TABLE IF NOT EXISTS packages (
    id SERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,

    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,

    price NUMERIC(12, 2) NOT NULL
        CHECK (price >= 0),

    duration_months INTEGER NOT NULL
        CHECK (duration_months > 0),

    includes JSONB NOT NULL DEFAULT '[]'::jsonb,

    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (admin_id)
        REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS packages_admin_id_idx
    ON packages (admin_id);

CREATE INDEX IF NOT EXISTS packages_is_active_idx
    ON packages (is_active);

ALTER TABLE packages DROP COLUMN IF EXISTS service_ids;
ALTER TABLE packages DROP COLUMN IF EXISTS appointment_ids;
