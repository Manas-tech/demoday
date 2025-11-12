-- Add is_visible column to page_settings table for page-level visibility control
ALTER TABLE page_settings
ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT TRUE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_page_settings_is_visible ON page_settings(is_visible);

-- Update existing records to be visible by default
UPDATE page_settings SET is_visible = TRUE WHERE is_visible IS NULL;

-- Set default visibility for speakers page (if it exists)
UPDATE page_settings 
SET is_visible = TRUE 
WHERE page_key = 'speakers' AND is_visible IS NULL;

