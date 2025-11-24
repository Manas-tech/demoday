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

import { GetStaticProps, GetStaticPaths } from 'next';
import { useEffect, useState } from 'react';

import Page from '@components/page';
import SponsorSection from '@components/sponsor-section';
import Layout from '@components/layout';

import { getAllSponsors } from '@lib/cms-api';
import { Sponsor } from '@lib/types';
import { META_DESCRIPTION } from '@lib/constants';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

type Props = {
  sponsor: Sponsor;
};

export default function SponsorPage({ sponsor: initialSponsor }: Props) {
  const [sponsor, setSponsor] = useState<Sponsor>(initialSponsor);

  // Fetch latest sponsor data client-side to get founderEmail
  useEffect(() => {
    const fetchSponsor = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: company, error } = await client
            .from('companies')
            .select(`
              *,
              company_links (*)
            `)
            .eq('slug', initialSponsor.slug)
            .maybeSingle();
          
          if (!error && company) {
            const updatedSponsor: Sponsor = {
              name: company.name,
              slug: company.slug,
              description: company.description,
              shortDescription: company.short_description,
              website: company.website,
              callToAction: company.call_to_action,
              callToActionLink: company.call_to_action_link,
              discord: company.discord,
              tier: company.tier,
              youtubeSlug: company.youtube_slug,
              cardImage: { url: company.card_image_url || '' },
              logo: { url: company.logo_url || company.card_image_url || '' },
              links: (company.company_links || []).map((link: any) => ({
                text: link.text,
                url: link.url
              })),
              founders: company.founders,
              founderEmail: company.founder_email || null
            };
            setSponsor(updatedSponsor);
          }
        } catch (error) {
          console.error('Error fetching sponsor:', error);
        }
      }
    };

    fetchSponsor();
    
    // Listen for sponsors/companies updates
    const handleSponsorsUpdate = () => {
      fetchSponsor();
    };
    
    window.addEventListener('sponsors-updated', handleSponsorsUpdate);
    
    return () => {
      window.removeEventListener('sponsors-updated', handleSponsorsUpdate);
    };
  }, [initialSponsor.slug]);

  const meta = {
    title: 'Demo - Virtual Event Starter Kit',
    description: META_DESCRIPTION
  };

  return (
    <Page meta={meta}>
      <Layout>
        <SponsorSection sponsor={sponsor} />
      </Layout>
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const slug = params?.slug;
  const sponsors = await getAllSponsors();
  const sponsor = sponsors?.find((s: Sponsor) => s.slug === slug) || null;

  if (!sponsor) {
    return {
      notFound: true
    };
  }

  // Ensure all fields are properly initialized with null values if undefined
  const sanitizedSponsor: Sponsor = {
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
    founders: sponsor.founders || null,
    founderEmail: sponsor.founderEmail || null
  };

  return {
    props: {
      sponsor: sanitizedSponsor
    },
    revalidate: 60
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const sponsors = await getAllSponsors();
    const slugs = sponsors?.map((s: Sponsor) => ({ params: { slug: s.slug } })) || [];

    return {
      paths: slugs,
      fallback: 'blocking'
    };
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    return {
      paths: [],
      fallback: 'blocking'
    };
  }
};
