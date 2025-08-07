-- Add rating column to housekeepers table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'housekeepers' AND column_name = 'rating') THEN
        ALTER TABLE housekeepers ADD COLUMN rating DECIMAL(3, 1);
    END IF;
END $$;

-- Update existing entries with a default rating between 4.0 and 5.0 if rating is null
UPDATE housekeepers 
SET rating = 4.0 + (random() * 1.0)
WHERE rating IS NULL AND status = 'approved';

-- Create index on rating column for better query performance
CREATE INDEX IF NOT EXISTS idx_housekeepers_rating ON housekeepers(rating);

-- Make sure hourly_rate is correctly named and exists (in case schema was inconsistent)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'housekeepers' AND column_name = 'hourlyrate') 
    AND NOT EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'housekeepers' AND column_name = 'hourly_rate') THEN
        ALTER TABLE housekeepers RENAME COLUMN hourlyrate TO hourly_rate;
    END IF;
END $$;

-- Verify that region field exists (or add it if it doesn't)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'housekeepers' AND column_name = 'region') THEN
        ALTER TABLE housekeepers ADD COLUMN region VARCHAR(255);
        -- Copy location to region for existing records
        UPDATE housekeepers SET region = location WHERE region IS NULL;
    END IF;
END $$;

-- Verify services is an array
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'housekeepers' 
          AND column_name = 'services' 
          AND data_type = 'ARRAY'
    ) THEN
        RAISE EXCEPTION 'The services column is not an array type. Please check your schema.';
    END IF;
END $$;

-- Log migration
SELECT 'Migration completed: Added rating field, verified hourly_rate and region fields, checked services array' as migration_status;
