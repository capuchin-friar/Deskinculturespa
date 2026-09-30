-- Consultation appointments can be added before a customer picks a shared time.
ALTER TABLE appointments
    ALTER COLUMN appointment_date DROP NOT NULL,
    ALTER COLUMN start_time DROP NOT NULL,
    ALTER COLUMN end_time DROP NOT NULL;

ALTER TABLE appointments
    ADD COLUMN scheduled_at TIMESTAMPTZ,
    ADD COLUMN consultation_name TEXT;

UPDATE appointments
SET scheduled_at = (appointment_date + start_time) AT TIME ZONE 'Africa/Lagos'
WHERE scheduled_at IS NULL;

CREATE INDEX idx_appointments_scheduled_at ON appointments(scheduled_at);
