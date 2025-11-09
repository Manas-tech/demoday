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
import styles from './sponsor-section.module.css';
import styleUtils from './utils.module.css';
import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { BRAND_COLOR, SITE_NAME } from '@lib/constants';
import { logUserEvent } from '@lib/log-event';

type Props = {
  sponsor: Sponsor;
};

export default function SponsorSection({ sponsor }: Props) {
  return (
    <div style={{ padding: '40px 24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Link
        href="/expo"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          color: '#499ca2',
          textDecoration: 'none',
          marginBottom: '32px',
          fontSize: '14px',
          fontWeight: 500
        }}
        aria-label="Back to companies"
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
        Back to companies
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '56px',
          alignItems: 'start'
        }}
      >
        {/* Left Section - Company Details */}
        <div
          style={{
            background: '#fff',
            padding: '48px',
            borderRadius: '16px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
        >
          <h1
            style={{
              fontSize: '40px',
              fontWeight: 800,
              margin: '0 0 32px 0',
              color: '#000',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {sponsor.name}
          </h1>
          <p
            style={{
              fontSize: '18px',
              lineHeight: '1.8',
              color: '#333',
              margin: '0 0 40px 0'
            }}
          >
            {sponsor.description}
          </p>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '40px' }}>
            {sponsor.callToActionLink && (
              <a
                href={sponsor.callToActionLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '14px 28px',
                  background: BRAND_COLOR,
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '18px',
                  display: 'inline-block'
                }}
                onClick={() =>
                  logUserEvent('visit_website', {
                    sponsor: sponsor.name,
                    url: sponsor.callToActionLink
                  })
                }
              >
                {sponsor.callToAction || 'Website'}
              </a>
            )}
            {sponsor.discord && (
              <Dialog.Root>
                <Dialog.Trigger asChild>
                  <button
                    type="button"
                    style={{
                      padding: '14px 28px',
                      background: BRAND_COLOR,
                      color: '#fff',
                      borderRadius: '8px',
                      border: 'none',
                      fontWeight: 600,
                      fontSize: '18px',
                      cursor: 'pointer'
                    }}
                    onClick={() =>
                      logUserEvent('connect_with_founder', { sponsor: sponsor.name })
                    }
                  >
                    Connect with Founder
                  </button>
                </Dialog.Trigger>
                <Dialog.Overlay
                  className="fixed inset-0"
                  style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9998 }}
                />
                <Dialog.Content
                  className="dialog-content bg-white md:w-[400px] w-[95%] rounded-lg p-6"
                  style={{
                    fontFamily: 'inherit',
                    color: '#222',
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 9999
                  }}
                >
                  <h2
                    style={{
                      fontWeight: 700,
                      fontSize: 22,
                      marginBottom: 12,
                      color: BRAND_COLOR
                    }}
                  >
                    Request Introduction?
                  </h2>
                  <p style={{ marginBottom: 24, fontSize: 16 }}>
                    Would you like to request an introduction to {sponsor.name}? The {SITE_NAME}{' '}
                    team will send an intro email.
                  </p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <Dialog.Close asChild>
                      <button
                        type="button"
                        style={{
                          padding: '10px 20px',
                          background: '#e0e0e0',
                          color: '#333',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        Cancel
                      </button>
                    </Dialog.Close>
                    <ConfirmIntroButton sponsor={sponsor} />
                  </div>
                </Dialog.Content>
              </Dialog.Root>
            )}
          </div>
          <div
            style={{
              borderTop: '1px solid #e0e0e0',
              paddingTop: '24px'
            }}
          >
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: '#499ca2',
                margin: '0 0 20px 0',
                letterSpacing: '1px'
              }}
            >
              RESOURCES
            </h2>
            {sponsor.links.map(link => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                download={`${sponsor.name}-OnePager.pdf`}
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '14px 24px',
                  background: '#333',
                  color: '#fff',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 500,
                  fontSize: '16px',
                  marginBottom: '8px'
                }}
                onClick={() =>
                  logUserEvent('resource_link', {
                    sponsor: sponsor.name,
                    url: link.url,
                    text: link.text
                  })
                }
              >
                <span>{link.text}</span>
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                >
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <path d="M15 3h6v6" />
                  <path d="M10 14L21 3" />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Right Section - Video */}
        {sponsor.youtubeSlug && (
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ position: 'relative', paddingBottom: '56.25%', background: '#000' }}>
              <iframe
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none'
                }}
                allow="picture-in-picture"
                allowFullScreen
                src={`https://youtube.com/embed/${sponsor.youtubeSlug}`}
                title={sponsor.name}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfirmIntroButton({ sponsor }: { sponsor: Sponsor }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      // Static site - just simulate success
      console.log('Request intro:', {
        sponsorName: sponsor.name,
        sponsorEmail: sponsor.discord,
        sponsorCompany: sponsor.name,
        founders: sponsor.founders
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <span style={{ color: BRAND_COLOR, fontWeight: 600, alignSelf: 'center' }}>
        Request sent!
      </span>
    );
  }
  return (
    <button
      type="button"
      style={{
        padding: '10px 20px',
        background: BRAND_COLOR,
        color: '#fff',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        minWidth: 100
      }}
      onClick={handleConfirm}
      disabled={loading}
    >
      {loading ? 'Sending...' : 'Confirm'}
    </button>
  );
}
