-- Migration to add test races for 2026
-- Adds column if missing and inserts 2 test races in Feb 2026

-- 1. Ensure is_test_race column exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'races' AND column_name = 'is_test_race') THEN 
        ALTER TABLE races ADD COLUMN is_test_race boolean DEFAULT false; 
    END IF; 
END $$;

-- 2. Insert Test Races
INSERT INTO races (name, date, track, status, is_test_race)
VALUES
  ('Bahrain Pre-Season Test 1', '2026-02-13 12:00:00+00', 'Bahrain International Circuit', 'scheduled', true),
  ('Bahrain Pre-Season Test 2', '2026-02-20 12:00:00+00', 'Bahrain International Circuit', 'scheduled', true);
