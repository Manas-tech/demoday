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
import SpeakerSection from '@components/speaker-section';
import Layout from '@components/layout';

import { getAllSpeakers } from '@lib/cms-api';
import { Speaker } from '@lib/types';
import { META_DESCRIPTION } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';

type Props = {
  speaker: Speaker;
};

export default function SpeakerPage({ speaker }: Props) {
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
        <SpeakerSection speaker={speaker} />
      </Layout>
    </Page>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  try {
    const speakers = await getAllSpeakers();

    if (!speakers || !Array.isArray(speakers)) {
      console.error('getAllSpeakers returned invalid data:', speakers);
      return {
        paths: [],
        fallback: false
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

    const slugs = validSpeakers.map(speaker => ({
      params: { slug: speaker.slug }
    }));

    return {
      paths: slugs,
      fallback: false
    };
  } catch (error) {
    console.error('Error in getStaticPaths:', error);
    return {
      paths: [],
      fallback: false
    };
  }
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  try {
    const slug = params?.slug;

    if (!slug || typeof slug !== 'string') {
      return {
        notFound: true
      };
    }

    const speakers = await getAllSpeakers();

    if (!speakers || !Array.isArray(speakers)) {
      console.error('getAllSpeakers returned invalid data:', speakers);
      return {
        notFound: true
      };
    }

    const currentSpeaker = speakers.find((s: Speaker) => s?.slug === slug);

    if (!currentSpeaker) {
      return {
        notFound: true
      };
    }

    // Sanitize speaker object
    const sanitizedSpeaker: Speaker = {
      name: currentSpeaker.name || '',
      bio: currentSpeaker.bio || '',
      title: currentSpeaker.title || '',
      slug: currentSpeaker.slug || '',
      twitter: currentSpeaker.twitter || '',
      github: currentSpeaker.github || '',
      company: currentSpeaker.company || '',
      talk: currentSpeaker.talk || null,
      image: currentSpeaker.image || { url: '' },
      imageSquare: currentSpeaker.imageSquare || { url: '' },
      linkedin: currentSpeaker.linkedin || ''
    };

    // Validate required fields
    if (!sanitizedSpeaker.name || !sanitizedSpeaker.slug) {
      console.error('Speaker missing required fields:', sanitizedSpeaker);
      return {
        notFound: true
      };
    }

    return {
      props: {
        speaker: sanitizedSpeaker
      },
      revalidate: 60
    };
  } catch (error) {
    console.error('Error in getStaticProps:', error);
    return {
      notFound: true
    };
  }
};
