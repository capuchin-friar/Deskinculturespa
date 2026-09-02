CREATE TYPE blog_status AS ENUM (
    'draft',
    'published',
    'archived'
);

CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,

    admin_id VARCHAR(255) NOT NULL,

    title VARCHAR(255) NOT NULL,

    summary TEXT,

    content TEXT NOT NULL,

    image_urls TEXT[],

    thumbnail_url TEXT,

    category VARCHAR(100),

    status blog_status NOT NULL DEFAULT 'draft',

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);