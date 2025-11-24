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

import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';

import Page from '@components/page';
import SpeakersGrid from '@components/speakers-grid';
import Layout from '@components/layout';
import Header from '@components/header';
import Image from 'next/image';
import { getAllSpeakers } from '@lib/cms-api';
import { Speaker } from '@lib/types';
import { META_DESCRIPTION, BRAND_NAME } from '@lib/constants';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

type Props = {
  speakers: Speaker[];
};

export default function Speakers({ speakers: initialSpeakers }: Props) {
  const [speakers, setSpeakers] = useState(initialSpeakers);
  const [panelistsImageUrl, setPanelistsImageUrl] = useState('https://xptrglblnutotevffhpd.supabase.co/storage/v1/object/public/pitchdeck//Panelists.jpeg');
  const [isPageVisible, setIsPageVisible] = useState(true);

  // Fetch speakers client-side to get latest updates
  useEffect(() => {
    const fetchSpeakers = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('speakers')
            .select('*')
            .order('name');
          
          if (!error && data) {
            const formattedSpeakers = data
              .filter((s: any) => s.is_visible !== false) // Only show visible speakers
              .map((s: any) => ({
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
            setSpeakers(formattedSpeakers);
          }
        } catch (error) {
          console.error('Error fetching speakers:', error);
        }
      }
    };

    fetchSpeakers();
    
    // Listen for speakers updates
    const handleSpeakersUpdate = () => {
      fetchSpeakers();
    };
    
    window.addEventListener('speakers-updated', handleSpeakersUpdate);
    
    return () => {
      window.removeEventListener('speakers-updated', handleSpeakersUpdate);
    };
  }, []);

  // Fetch panelists image URL and page visibility
  useEffect(() => {
    const fetchSpeakersSettings = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('page_settings')
            .select('description, is_visible')
            .eq('page_key', 'speakers')
            .maybeSingle();
          
          if (!error && data) {
            if (data.description) {
              setPanelistsImageUrl(data.description);
            }
            setIsPageVisible(data.is_visible !== false); // Default to true if null
          }
        } catch (error) {
          console.error('Error fetching speakers settings:', error);
        }
      }
    };

    fetchSpeakersSettings();
    
    // Listen for speakers settings updates
    const handleSpeakersSettingsUpdate = () => {
      fetchSpeakersSettings();
    };
    
    window.addEventListener('speakers-settings-updated', handleSpeakersSettingsUpdate);
    
    return () => {
      window.removeEventListener('speakers-settings-updated', handleSpeakersSettingsUpdate);
    };
  }, []);

  const meta = {
    title: `Speakers - ${BRAND_NAME} Panelists`,
    description: META_DESCRIPTION
  };

  if (!isPageVisible) {
    return (
      <Page meta={meta}>
        <Layout>
          <Header
            hero={`Speakers - ${BRAND_NAME}`}
          />
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 600, color: '#333', marginBottom: '16px' }}>
              This page is currently unavailable
            </h2>
            <p style={{ fontSize: '16px', color: '#666' }}>
              The speakers page has been temporarily hidden. Please check back later.
            </p>
          </div>
        </Layout>
      </Page>
    );
  }

  return (
    <Page meta={meta}>
      <Layout>
        <Header
          hero={`Speakers - ${BRAND_NAME}`}
          // description={META_DESCRIPTION}
          // description={
          //   'Our featured panel, "The Future of Business with Agentic AI", will examine how agentic AI is reshaping industries and business models. It will be moderated by Rachna Dayal, Founder & Managing Partner at Sugati Ventures, an experienced venture capitalist focused on HealthTech and AI.'
          // }
        />
        {panelistsImageUrl && (
          <Image
            src={panelistsImageUrl}
            alt="Panelists Image"
            width={1000}
            height={1000}
            style={{ width: '100%', height: 'auto' }}
          />
        )}
        <SpeakersGrid speakers={speakers} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  try {
    const speakers = await getAllSpeakers();

    if (!speakers || !Array.isArray(speakers)) {
      console.error('getAllSpeakers returned invalid data:', speakers);
      return {
        props: {
          speakers: []
        },
        revalidate: 60
      };
    }

    // Filter out any invalid speakers
    const validSpeakers = speakers.filter((speaker): speaker is Speaker => {
      return (
        speaker &&
        typeof speaker === 'object' &&
        typeof speaker.name === 'string' &&
        typeof speaker.slug === 'string' &&
        !!speaker.name &&
        !!speaker.slug
      );
    });

    return {
      props: {
        speakers: validSpeakers
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error fetching speakers:', error);
    return {
      props: {
        speakers: []
      },
      revalidate: 60
    };
  }
};
