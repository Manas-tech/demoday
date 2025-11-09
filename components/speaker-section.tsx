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
import GithubIcon from '@components/icons/icon-github';
import { Speaker } from '@lib/types';
import styles from './speaker-section.module.css';
import { BRAND_COLOR } from '@lib/constants';

const TwitterIcon = () => (
  <svg width={24} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M23.643 4.93695C22.808 5.30695 21.911 5.55695 20.968 5.66995C21.93 5.09395 22.668 4.17995 23.016 3.09195C22.116 3.62595 21.119 4.01395 20.058 4.22195C19.208 3.31795 17.998 2.75195 16.658 2.75195C14.086 2.75195 12 4.83795 12 7.41195C12 7.77595 12.042 8.12995 12.12 8.47195C8.24701 8.27695 4.81601 6.42195 2.51801 3.60395C2.11801 4.29395 1.88801 5.09395 1.88801 5.94595C1.88801 7.56195 2.71101 8.98895 3.96001 9.82395C3.19601 9.79895 2.47801 9.58995 1.85001 9.24095V9.30095C1.85001 11.558 3.45501 13.441 5.58701 13.869C5.19501 13.975 4.78401 14.031 4.36001 14.031C4.06001 14.031 3.76701 14.003 3.48301 13.949C4.07601 15.799 5.79601 17.147 7.83501 17.183C6.24001 18.433 4.23101 19.178 2.04901 19.178C1.67301 19.178 1.30201 19.156 0.937012 19.113C2.99901 20.436 5.44701 21.206 8.07701 21.206C16.647 21.206 21.332 14.108 21.332 7.95195C21.332 7.75195 21.327 7.54995 21.318 7.34995C22.228 6.69195 23.018 5.87295 23.641 4.93995L23.643 4.93695Z"
      fill="#D8D8D8"
    />
  </svg>
);
const LinkedInIcon = () => (
  <svg width={24} viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

type Props = {
  speaker: Speaker;
};

export default function SpeakerSection({ speaker }: Props) {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Link
        href="/speakers"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#499ca2',
          textDecoration: 'none',
          marginBottom: '32px',
          fontSize: '14px',
          fontWeight: 500
        }}
        aria-label="Back to speakers"
      >
        <svg
          viewBox="0 0 24 24"
          width="20"
          height="20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          style={{ marginRight: '8px' }}
        >
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to speakers
      </Link>

      <div
        style={{
          display: 'flex',
          gap: '48px',
          background: '#fff',
          padding: '40px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ flexShrink: 0 }}>
          <div
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: `6px solid ${BRAND_COLOR}`,
              padding: '6px',
              overflow: 'hidden',
              background: '#fff'
            }}
          >
            <Image
              alt={speaker.name}
              title={speaker.name}
              src={speaker.imageSquare?.url || speaker.image.url}
              width={188}
              height={188}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%'
              }}
              loading="lazy"
              placeholder={speaker.image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={speaker.image.blurDataURL}
            />
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h1
            style={{
              color: BRAND_COLOR,
              fontSize: '32px',
              fontWeight: 800,
              margin: '0 0 12px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {speaker.name}
          </h1>
          <p
            style={{
              color: '#333',
              fontSize: '16px',
              margin: '0 0 32px 0',
              fontWeight: 500
            }}
          >
            {speaker.title} @{' '}
            <span style={{ color: '#499ca2', fontWeight: 600 }}>{speaker.company}</span>
          </p>

          <h2
            style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 12px 0'
            }}
          >
            BIO
          </h2>
          <p
            style={{
              color: '#333',
              fontSize: '16px',
              lineHeight: '1.6',
              margin: '0 0 32px 0'
            }}
          >
            {speaker.bio}
          </p>

          <h3
            style={{
              color: '#333',
              fontSize: '14px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              margin: '0 0 16px 0'
            }}
          >
            SOCIAL MEDIA
          </h3>
          <div style={{ display: 'flex', gap: '12px' }}>
            {speaker.linkedin ? (
              <a
                href={speaker.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`LinkedIn profile of ${speaker.name}`}
                style={{
                  width: '48px',
                  height: '48px',
                  background: BRAND_COLOR,
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'opacity 0.2s',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <LinkedInIcon />
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
