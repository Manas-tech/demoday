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
import { useRouter } from 'next/router';

import Page from '@components/page';
import SponsorsGrid from '@components/sponsors-grid';
import Header from '@components/header';
import Layout from '@components/layout';

import { getAllSponsors, getExpoPageSettings } from '@lib/cms-api';
import { Sponsor } from '@lib/types';
import { META_DESCRIPTION } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

type Props = {
  sponsors: Sponsor[];
  expoSettings: {
    hero_title: string;
    description: string;
  };
};

export default function ExpoPage({ sponsors: initialSponsors, expoSettings: initialExpoSettings }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const [expoSettings, setExpoSettings] = useState(initialExpoSettings);
  const [sponsors, setSponsors] = useState(initialSponsors);

  useEffect(() => {
    // Wait for auth loading to complete
    if (loading) return;

    // If user is not logged in after loading completes, redirect to login
    if (!isLoggedIn) {
      router.replace('/login');
    } else {
      setCheckingSession(false);
    }
  }, [loading, isLoggedIn, router]);

  // Fetch expo settings client-side to get latest updates
  useEffect(() => {
    const fetchExpoSettings = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('page_settings')
            .select('hero_title, description')
            .eq('page_key', 'expo')
            .maybeSingle();
          
          if (!error && data) {
            setExpoSettings({
              hero_title: data.hero_title || 'Cohort 11',
              description: data.description || initialExpoSettings.description
            });
          }
        } catch (error) {
          console.error('Error fetching expo settings:', error);
        }
      }
    };

    if (isLoggedIn && !loading) {
      fetchExpoSettings();
      
      // Listen for expo settings updates
      const handleExpoSettingsUpdate = () => {
        fetchExpoSettings();
      };
      
      window.addEventListener('expo-settings-updated', handleExpoSettingsUpdate);
      
      return () => {
        window.removeEventListener('expo-settings-updated', handleExpoSettingsUpdate);
      };
    }
  }, [isLoggedIn, loading, initialExpoSettings]);

  // Fetch sponsors client-side to get latest updates
  useEffect(() => {
    const fetchSponsors = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: companies, error } = await client
            .from('companies')
            .select(`
              *,
              company_links (*)
            `)
            .order('name');
          
          if (!error && companies) {
            const formattedSponsors = companies
              .filter((c: any) => c.is_visible !== false) // Only show visible companies
              .map((c: any) => ({
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
            setSponsors(formattedSponsors);
          }
        } catch (error) {
          console.error('Error fetching sponsors:', error);
        }
      }
    };

    if (isLoggedIn && !loading) {
      fetchSponsors();
      
      // Listen for sponsors/companies updates
      const handleSponsorsUpdate = () => {
        fetchSponsors();
      };
      
      window.addEventListener('sponsors-updated', handleSponsorsUpdate);
      
      return () => {
        window.removeEventListener('sponsors-updated', handleSponsorsUpdate);
      };
    }
  }, [isLoggedIn, loading]);

  const meta = {
    title: 'MARL Accelerator Demo Day',
    description: META_DESCRIPTION
  };

  if (loading || checkingSession) {
    return (
      <Page meta={meta}>
        <Layout>
          <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
        </Layout>
      </Page>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Page meta={meta}>
      <Layout>
        <Header hero={expoSettings.hero_title} description={expoSettings.description} />
        <SponsorsGrid sponsors={sponsors} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const sponsors = await getAllSponsors();
  const expoSettings = await getExpoPageSettings();

  // Sanitize each sponsor's data
  const sanitizedSponsors = (sponsors || []).map(sponsor => ({
    name: sponsor.name || '',
    description: sponsor.description || '',
    slug: sponsor.slug || '',
    website: sponsor.website || null,
    callToAction: sponsor.callToAction || null,
    callToActionLink: sponsor.callToActionLink || null,
    discord: sponsor.discord || null,
    youtubeSlug: sponsor.youtubeSlug || null,
    tier: sponsor.tier || null,
    links: Array.isArray(sponsor.links) ? sponsor.links : [],
    cardImage: {
      url: sponsor.cardImage?.url || ''
    },
    logo: {
      url: sponsor.logo?.url || ''
    },
    shortDescription: sponsor.shortDescription || null,
    founders: sponsor.founders || null
  }));

  return {
    props: {
      sponsors: sanitizedSponsors,
      expoSettings
    },
    revalidate: 60
  };
};
