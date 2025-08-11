-- Make email field optional in housekeepers table
ALTER TABLE housekeepers ALTER COLUMN email DROP NOT NULL;

-- Update validation trigger if needed
-- Note: PostgreSQL still maintains the UNIQUE constraint, which means
-- if an email is provided, it must be unique across all records
