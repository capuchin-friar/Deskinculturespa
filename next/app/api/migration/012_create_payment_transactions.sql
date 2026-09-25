CREATE TABLE transactions (
    id BIGSERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    customer_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    provider VARCHAR(30) NOT NULL DEFAULT 'paystack',
    reference VARCHAR(255) NOT NULL UNIQUE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10) NOT NULL DEFAULT 'NGN',
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'success', 'failed', 'abandoned', 'reversed', 'refunded')),
    paid_at TIMESTAMPTZ,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_status ON transactions(status);

CREATE TABLE paystack_transactions (
    id BIGSERIAL PRIMARY KEY,
    transaction_id BIGINT NOT NULL UNIQUE REFERENCES transactions(id) ON DELETE CASCADE,
    paystack_id BIGINT UNIQUE,
    reference VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL,
    amount BIGINT NOT NULL CHECK (amount >= 0),
    currency VARCHAR(10),
    channel VARCHAR(50),
    gateway_response TEXT,
    paid_at TIMESTAMPTZ,
    customer_email VARCHAR(320),
    authorization JSONB,
    raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_paystack_transactions_status ON paystack_transactions(status);
CREATE INDEX idx_paystack_transactions_paystack_id ON paystack_transactions(paystack_id);
