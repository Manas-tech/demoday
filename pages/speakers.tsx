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
import { useEffect } from 'react';
import { useRouter } from 'next/router';

import Page from '@components/page';
import SpeakersGrid from '@components/speakers-grid';
import Layout from '@components/layout';
import Header from '@components/header';
import Image from 'next/image';
import { getAllSpeakers } from '@lib/cms-api';
import { Speaker } from '@lib/types';
import { META_DESCRIPTION, BRAND_NAME } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';

type Props = {
  speakers: Speaker[];
};

export default function Speakers({ speakers }: Props) {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.replace('/login');
    }
  }, [loading, isLoggedIn, router]);

  const meta = {
    title: `Speakers - ${BRAND_NAME} Panelists`,
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
        <Header
          hero={`Speakers - ${BRAND_NAME}`}
          // description={META_DESCRIPTION}
          // description={
          //   'Our featured panel, "The Future of Business with Agentic AI", will examine how agentic AI is reshaping industries and business models. It will be moderated by Rachna Dayal, Founder & Managing Partner at Sugati Ventures, an experienced venture capitalist focused on HealthTech and AI.'
          // }
        />
        <Image
          src="https://xptrglblnutotevffhpd.supabase.co/storage/v1/object/public/pitchdeck//Panelists.jpeg"
          alt="Panelits Image"
          width={1000}
          height={1000}
          style={{ width: '100%', height: 'auto' }}
        />
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
