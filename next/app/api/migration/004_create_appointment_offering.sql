CREATE TYPE consultation_mode AS ENUM (
    'physical',
    'video',
    'audio',
    'chat'
);

CREATE TABLE consultation_offerings (
    id SERIAL PRIMARY KEY,

    consultant_id BIGINT NOT NULL,

    mode consultation_mode NOT NULL,

    duration_minutes INTEGER NOT NULL
        CHECK (duration_minutes > 0),

    price NUMERIC(12, 2) NOT NULL
        CHECK (price >= 0),
        
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (consultant_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);