-- Add full_name and email columns to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Verify
SELECT id, username, full_name, email, role FROM profiles ORDER BY username LIMIT 5;
