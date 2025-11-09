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

import { useRouter } from 'next/router';
import Head from 'next/head';
import TicketColored from './ticket-colored';
import TicketColoredMobile from './ticket-colored-mobile';
import TicketMono from './ticket-mono';
import TicketMonoMobile from './ticket-mono-mobile';
import TicketProfile from './ticket-profile';
import TicketInfo from './ticket-info';
import { TicketGenerationState } from '@lib/constants';
import styles from './ticket-image.module.css';

type Props = {
  size?: number;
  name?: string;
  username?: string;
};

function TicketImage({ size = 1, name, username }: Props) {
  return (
    <div className={styles.visual} style={{ ['--size' as string]: size }}>
      <div className={styles['horizontal-ticket']}>
        {username ? <TicketColored /> : <TicketMono />}
      </div>
      <div className={styles['vertical-ticket']}>
        {username ? <TicketColoredMobile /> : <TicketMonoMobile />}
      </div>
      <div className={styles.profile}>
        <TicketProfile
          name={name}
          username={username}
          size={size}
          ticketGenerationState="default"
        />
      </div>
      <div className={styles.info}>
        <TicketInfo logoTextSecondaryColor={username ? 'var(--brand)' : undefined} />
      </div>
    </div>
  );
}

export default function TicketImagePage() {
  const router = useRouter();
  const { query } = router;

  return (
    <div className={styles.container}>
      <Head>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&Noto+Sans+HK:wght@700&family=Noto+Sans+JP:wght@700&family=Noto+Sans+KR:wght@700&family=Noto+Sans+SC:wght@700&family=Noto+Sans+TC:wght@700&family=Noto+Sans:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <TicketImage
        size={1700 / 650}
        username={query.username ? query.username.toString() : undefined}
        name={
          query.name
            ? query.name?.toString()
            : query.username
              ? query.username.toString()
              : undefined
        }
      />
    </div>
  );
}
