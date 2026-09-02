CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    admin_id BIGINT NOT NULL,

    name VARCHAR(150) NOT NULL,
    description TEXT,

    price NUMERIC(12, 2) NOT NULL
        CHECK (price >= 0),

    duration_minutes INTEGER,

    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (admin_id)
        REFERENCES users(id)
);