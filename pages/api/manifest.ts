import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'site.webmanifest');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const manifest = JSON.parse(fileContents);

    res.setHeader('Content-Type', 'application/manifest+json');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).json(manifest);
  } catch (error) {
    console.error('Error serving manifest:', error);
    // Return a default manifest if file read fails
    res.setHeader('Content-Type', 'application/manifest+json');
    res.status(200).json({
      name: 'Virtual Event Starter Kit',
      short_name: 'Virtual Event Starter Kit',
      display: 'standalone',
      start_url: '/',
      theme_color: '#fff',
      background_color: '#000000',
      icons: []
    });
  }
}

