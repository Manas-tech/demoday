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
import { Sponsor } from '@lib/types';
import styles from './sponsors-grid.module.css';
import { BRAND_COLOR } from '@lib/constants';
import { logUserEvent } from '@lib/log-event';

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  return (
    <Link
      key={sponsor.name}
      href={`/expo/${sponsor.slug}`}
      role="button"
      tabIndex={0}
      style={{
        border: `2px solid ${BRAND_COLOR}`,
        borderRadius: '16px',
        background: '#fff',
        padding: '40px 32px',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        minHeight: '420px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
      }}
      onClick={() => logUserEvent('click_company', { sponsor: sponsor.name })}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '180px',
          border: '1px solid #f0f0f0'
        }}
      >
        <Image
          alt={sponsor.name}
          src={sponsor.cardImage?.url || sponsor.logo?.url || ''}
          width={300}
          height={200}
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            borderRadius: '8px'
          }}
          loading="lazy"
          quality={80}
          title={sponsor.name}
        />
      </div>
      <h2
        style={{
          color: BRAND_COLOR,
          fontSize: '24px',
          fontWeight: 700,
          margin: '0 0 20px 0',
          textAlign: 'center',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {sponsor.name}
      </h2>
      <p
        style={{
          color: '#666',
          fontSize: '16px',
          lineHeight: '1.7',
          margin: 0,
          textAlign: 'left',
          flex: 1
        }}
      >
        {sponsor.shortDescription || sponsor.description}
      </p>
    </Link>
  );
}

type Props = {
  sponsors: Sponsor[];
};

export default function SponsorsGrid({ sponsors }: Props) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '40px',
        padding: '40px 24px',
        maxWidth: '1400px',
        margin: '0 auto'
      }}
    >
      {sponsors?.map(sponsor => <SponsorCard key={sponsor.name} sponsor={sponsor} />)}
    </div>
  );
}
