-- A service can be added to a customer's bookings before an appointment time is arranged.
ALTER TABLE bookings
    ALTER COLUMN scheduled_at DROP NOT NULL;
