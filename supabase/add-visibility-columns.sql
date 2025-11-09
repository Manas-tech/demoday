-- Add is_visible column to speakers table
ALTER TABLE speakers 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add is_visible column to companies table
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_speakers_is_visible ON speakers(is_visible);
CREATE INDEX IF NOT EXISTS idx_companies_is_visible ON companies(is_visible);

-- Update existing records to be visible by default
UPDATE speakers SET is_visible = true WHERE is_visible IS NULL;
UPDATE companies SET is_visible = true WHERE is_visible IS NULL;

