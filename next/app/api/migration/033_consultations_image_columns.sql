-- Cloudinary URLs and titles do not fit VARCHAR(44).
ALTER TABLE consultations
    ALTER COLUMN thumbnail_url TYPE TEXT,
    ALTER COLUMN slug TYPE TEXT;

ALTER TABLE consultations
    ADD COLUMN IF NOT EXISTS description TEXT;
