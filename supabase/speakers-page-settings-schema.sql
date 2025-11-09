-- Insert or update speakers page settings in page_settings table
-- This will store the panelists image URL
INSERT INTO page_settings (page_key, hero_title, description)
VALUES (
  'speakers',
  'Speakers - MARL Accelerator',
  'https://xptrglblnutotevffhpd.supabase.co/storage/v1/object/public/pitchdeck//Panelists.jpeg'
)
ON CONFLICT (page_key) DO UPDATE
SET description = EXCLUDED.description
WHERE page_settings.page_key = 'speakers';

-- Note: We're using the description field to store the image URL
-- You can also add a dedicated image_url column if preferred

