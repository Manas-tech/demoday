/**
 * Copyright 2020 Vercel Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { Job, Sponsor, Stage, Speaker } from '@lib/types';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Fallback to JSON files if Supabase is not configured
const dataDir = path.join(process.cwd(), 'data');

function readJsonFile<T>(filename: string): T[] {
  try {
    const filePath = path.join(dataDir, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

export async function getAllSpeakers(): Promise<Speaker[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('speakers')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching speakers from Supabase:', error);
        return readJsonFile<Speaker>('speakers.json');
      }
      
      return (data || []).map((s: any) => ({
        name: s.name,
        slug: s.slug,
        title: s.title,
        company: s.company,
        bio: s.bio,
        image: { url: s.image_url || '' },
        imageSquare: { url: s.image_square_url || s.image_url || '' },
        twitter: s.twitter || '',
        github: s.github || '',
        linkedin: s.linkedin || ''
      }));
    } catch (error) {
      console.error('Error fetching speakers:', error);
      return readJsonFile<Speaker>('speakers.json');
    }
  }
  return readJsonFile<Speaker>('speakers.json');
}

export async function getAllStages(): Promise<Stage[]> {
  // Stages are still from JSON for now
  return readJsonFile<Stage>('stages.json');
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  if (supabase) {
    try {
      const { data: companies, error } = await supabase
        .from('companies')
        .select(`
          *,
          company_links (*)
        `)
        .order('name');
      
      if (error) {
        console.error('Error fetching companies from Supabase:', error);
        return readJsonFile<Sponsor>('sponsors.json');
      }
      
      return (companies || []).map((c: any) => ({
        name: c.name,
        slug: c.slug,
        description: c.description,
        shortDescription: c.short_description,
        website: c.website,
        callToAction: c.call_to_action,
        callToActionLink: c.call_to_action_link,
        discord: c.discord,
        tier: c.tier,
        youtubeSlug: c.youtube_slug,
        cardImage: { url: c.card_image_url || '' },
        logo: { url: c.logo_url || c.card_image_url || '' },
        links: (c.company_links || []).map((link: any) => ({
          text: link.text,
          url: link.url
        })),
        founders: c.founders
      }));
    } catch (error) {
      console.error('Error fetching companies:', error);
      return readJsonFile<Sponsor>('sponsors.json');
    }
  }
  return readJsonFile<Sponsor>('sponsors.json');
}

export async function getAllJobs(): Promise<Job[]> {
  return readJsonFile<Job>('jobs.json');
}
