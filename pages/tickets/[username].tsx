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
import Error from 'next/error';
import Head from 'next/head';
import { SkipNavContent } from '@reach/skip-nav';
import { getUserByUsername } from '@lib/db-api';

import Page from '@components/page';
import ConfContent from '@components/index';
import { SITE_URL, SITE_NAME, META_DESCRIPTION, SAMPLE_TICKET_NUMBER } from '@lib/constants';

type Props = {
  username: string | null;
  usernameFromParams: string | null;
  name: string | null;
};

export default function TicketShare({ username, name, usernameFromParams }: Props) {
  if (!username) {
    return <Error statusCode={404} />;
  }

  return (
    <Page
      meta={{
        title: `${name ? `${name}'s` : 'Your'} Ticket - ${SITE_NAME}`,
        description: META_DESCRIPTION
      }}
    >
      <SkipNavContent />
      <ConfContent
        defaultUserData={{
          username: username || undefined,
          name: name || undefined
        }}
        sharePage
      />
    </Page>
  );
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const username = params?.username?.toString() || null;
  let name: string | null | undefined;

  if (username) {
    const user = await getUserByUsername(username);
    name = user.name ?? user.username;
  }
  return {
    props: {
      username: username,
      usernameFromParams: username || null,
      name: name || username || null
    },
    revalidate: 5
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  return Promise.resolve({
    paths: [],
    fallback: 'blocking'
  });
};
