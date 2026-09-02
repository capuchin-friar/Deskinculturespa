CREATE TYPE appointment_status AS ENUM (
    'pending',
    'confirmed',
    'completed',
    'cancelled',
    'no_show'
);

CREATE TYPE appointment_payment_status AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded'
);

CREATE TABLE appointments (
    appointment_id SERIAL PRIMARY KEY,

    customer_id BIGINT NOT NULL,
    consultant_id BIGINT NOT NULL,
    offering_id BIGINT NOT NULL,

    appointment_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,

    amount NUMERIC(12, 2) NOT NULL
        CHECK (amount >= 0),

    status appointment_status NOT NULL DEFAULT 'pending',

    payment_status appointment_payment_status
        NOT NULL DEFAULT 'pending',

    notes TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    FOREIGN KEY (consultant_id)
        REFERENCES users(id),

    FOREIGN KEY (offering_id)
        REFERENCES consultation_offerings(id)
);