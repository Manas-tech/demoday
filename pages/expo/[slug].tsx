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
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Page from '@components/page';
import SponsorSection from '@components/sponsor-section';
import Layout from '@components/layout';

import { getAllSponsors } from '@lib/cms-api';
import { Sponsor } from '@lib/types';
import { META_DESCRIPTION } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';

type Props = {
  sponsor: Sponsor;
};

export default function SponsorPage({ sponsor }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [loading, isLoggedIn, router]);

  const meta = {
    title: 'Demo - Virtual Event Starter Kit',
    description: META_DESCRIPTION
  };

  if (loading) {
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
    founders: sponsor.founders || null
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
