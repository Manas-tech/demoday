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

import Link from 'next/link';
import Image from 'next/image';
import cn from 'classnames';
import { Speaker } from '@lib/types';
import styles from './speakers-grid.module.css';
import { BRAND_COLOR } from '@lib/constants';

function SpeakerCard({ speaker }: { speaker: Speaker }) {
  return (
    <Link
      key={speaker.name}
      href={`/speakers/${speaker.slug}`}
      role="button"
      tabIndex={0}
      className={styles.card}
      style={{
        border: `2px solid ${BRAND_COLOR}`,
        borderRadius: '16px',
        background: '#fff',
        padding: '40px 32px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        minWidth: '320px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '180px',
          height: '180px',
          borderRadius: '50%',
          border: `5px solid ${BRAND_COLOR}`,
          padding: '5px',
          marginBottom: '24px',
          overflow: 'hidden',
          background: '#fff'
        }}
      >
        <Image
          alt={speaker.name}
          src={speaker.imageSquare?.url || speaker.image.url}
          width={170}
          height={170}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%'
          }}
          loading="lazy"
          quality={80}
          title={speaker.name}
        />
      </div>
      <h2
        style={{
          color: BRAND_COLOR,
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 12px 0',
          textTransform: 'uppercase',
          textAlign: 'center',
          letterSpacing: '0.5px'
        }}
      >
        {speaker.name}
      </h2>
      <p
        style={{
          color: '#333',
          fontSize: '16px',
          fontWeight: 500,
          margin: '0 0 6px 0',
          textAlign: 'center'
        }}
      >
        {speaker.title}
      </p>
      <p
        style={{
          color: '#999',
          fontSize: '14px',
          margin: 0,
          textAlign: 'center'
        }}
      >
        {speaker.company}
      </p>
    </Link>
  );
}

type Props = {
  speakers: Speaker[];
};

export default function SpeakersGrid({ speakers }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '40px',
        padding: '40px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}
    >
      {speakers?.map(speaker => <SpeakerCard key={speaker.name} speaker={speaker} />)}
    </div>
  );
}
