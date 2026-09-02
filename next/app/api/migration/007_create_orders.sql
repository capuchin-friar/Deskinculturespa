CREATE TABLE orders (
    id SERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL
        REFERENCES users(id)
        ON DELETE RESTRICT,

    order_type VARCHAR(20) NOT NULL
        CHECK (order_type IN ('product', 'service', 'appointment')),

    status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (
            status IN (
                'pending',
                'confirmed',
                'processing',
                'completed',
                'cancelled',
                'refunded'
            )
        ),

    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (
            payment_status IN (
                'pending',
                'paid',
                'failed',
                'refunded'
            )
        ),

    amount_paid NUMERIC(12,2) NOT NULL DEFAULT 0,

    shipping_fee NUMERIC(12,2) NOT NULL DEFAULT 0,

    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',

    discount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    total_paid NUMERIC(12,2) NOT NULL DEFAULT 0,

    shipping_address TEXT NOT NULL,

    payment_reference VARCHAR(255),

    shipping_method VARCHAR(100),

    estimated_delivery_date TIMESTAMP,

    tracking_number VARCHAR(255),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);