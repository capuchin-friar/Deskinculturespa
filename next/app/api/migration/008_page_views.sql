CREATE TABLE page_views (
    id SERIAL PRIMARY KEY,

    page_path TEXT NOT NULL,

    visitor_id BIGINT,

    user_id UUID
        REFERENCES users(id)
        ON DELETE SET NULL,

    referrer TEXT,

    user_agent TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);