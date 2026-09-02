CREATE TABLE products (
    id SERIAL PRIMARY KEY,

    admin_id VARCHAR(255) NOT NULL,

    name VARCHAR(255) NOT NULL,

    description TEXT,

    category VARCHAR(100),
    subcategory VARCHAR(100),

    brand VARCHAR(100),

    images TEXT[] NOT NULL,
    thumbnail_url  TEXT NOT NULL,

    specifications JSONB DEFAULT '{}',

    status VARCHAR(20) DEFAULT 'draft'
        CHECK (status IN ('draft','active','archived')),

    is_published BOOLEAN DEFAULT true,
    published_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

