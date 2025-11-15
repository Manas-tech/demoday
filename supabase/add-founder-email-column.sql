-- Add founder_email column to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS founder_email TEXT;

