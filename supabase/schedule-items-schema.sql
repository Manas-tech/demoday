-- Schedule Items table
CREATE TABLE IF NOT EXISTS schedule_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security for schedule_items
ALTER TABLE schedule_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for schedule_items (public read, admin write)
CREATE POLICY "Schedule items are viewable by everyone" ON schedule_items
  FOR SELECT USING (true);

CREATE POLICY "Admins can insert schedule items" ON schedule_items
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update schedule items" ON schedule_items
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can delete schedule items" ON schedule_items
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_schedule_items_display_order ON schedule_items(display_order);
CREATE INDEX IF NOT EXISTS idx_schedule_items_is_visible ON schedule_items(is_visible);

-- Insert default schedule items if they don't exist
INSERT INTO schedule_items (time, title, description, display_order) VALUES
  ('1:00 PM', 'WELCOME & AGENDA OVERVIEW', NULL, 1),
  ('1:05 PM', 'INTRO TO MARL', NULL, 2),
  ('1:10 PM', 'STARTUP PITCHES', '13 startups, ~5 minutes each', 3),
  ('2:20 PM', 'PANEL DISCUSSION: THE FUTURE OF BUSINESS WITH AGENTIC AI', NULL, 4),
  ('2:55 PM', 'CLOSING REMARKS', NULL, 5)
ON CONFLICT DO NOTHING;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_schedule_items_updated_at BEFORE UPDATE ON schedule_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

