-- Create storage bucket for pitchdeck files
-- Run this in your Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitchdeck', 'pitchdeck', true)
ON CONFLICT (id) DO NOTHING;

-- Set up storage policies for public read access
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT
USING (bucket_id = 'pitchdeck');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'pitchdeck' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'pitchdeck' AND
  auth.role() = 'authenticated'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'pitchdeck' AND
  auth.role() = 'authenticated'
);

