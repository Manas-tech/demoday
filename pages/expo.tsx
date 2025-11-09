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

import { getAllSponsors } from '@lib/cms-api';
import { Sponsor } from '@lib/types';
import { META_DESCRIPTION } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

type Props = {
  sponsors: Sponsor[];
};

export default function ExpoPage({ sponsors }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      // Wait for loading to complete
      if (loading) return;
      
      // If user is logged in, we're good
      if (isLoggedIn) {
        setCheckingSession(false);
        return;
      }

      // Check session directly as a fallback
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            // Session exists, wait a bit for user state to be set
            setTimeout(() => {
              setCheckingSession(false);
            }, 1000);
            return;
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }

      // No session found, redirect to login
      setCheckingSession(false);
      router.replace('/login');
    };

    checkAuth();
  }, [loading, isLoggedIn, router]);

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
        <Header hero="Cohort 11" description={meta.description} />
        <SponsorsGrid sponsors={sponsors} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const sponsors = await getAllSponsors();

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
      sponsors: sanitizedSponsors
    },
    revalidate: 60
  };
};
