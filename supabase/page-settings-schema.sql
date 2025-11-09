-- Page Settings table for storing page-specific content (like Expo page hero and description)
CREATE TABLE IF NOT EXISTS page_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page_key TEXT UNIQUE NOT NULL,
  hero_title TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE page_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for page_settings (public read, admin write)
CREATE POLICY "Page settings are viewable by everyone" ON page_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert page settings" ON page_settings
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update page settings" ON page_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete page settings" ON page_settings
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index
CREATE INDEX IF NOT EXISTS idx_page_settings_page_key ON page_settings(page_key);

-- Trigger for updated_at
CREATE TRIGGER update_page_settings_updated_at BEFORE UPDATE ON page_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default expo page settings
INSERT INTO page_settings (page_key, hero_title, description)
VALUES (
  'expo',
  'Cohort 11',
  'Discover Cohort 11 of MARL Accelerator''s Demo Day: explore startups, meet founders, view profiles and resources, and connect with pioneering teams.'
)
ON CONFLICT (page_key) DO NOTHING;

