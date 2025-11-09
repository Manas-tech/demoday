import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.status(500).json({ error: 'Supabase configuration missing' });
  }

  try {
    const { file, folder } = req.body;

    if (!file || !file.data || !file.name) {
      return res.status(400).json({ error: 'File data is required' });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Convert base64 to buffer
    const base64Data = file.data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${folder || 'uploads'}/${timestamp}-${randomStr}.${fileExt}`;

    // Upload to Supabase Storage (bucket name: 'images')
    // Note: You need to create a 'images' bucket in Supabase Storage with public access
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      // If bucket doesn't exist, provide helpful error
      if (uploadError.message?.includes('Bucket not found')) {
        return res.status(500).json({ 
          error: 'Storage bucket "images" not found. Please create it in Supabase Storage settings.',
          details: uploadError.message
        });
      }
      return res.status(500).json({ error: uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return res.status(200).json({ 
      url: publicUrl,
      path: fileName
    });
  } catch (error: any) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
}

