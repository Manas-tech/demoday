import React from 'react';
import IconLogo from '@components/icons/icon-logo';
import Link from 'next/link';

export default function CheckEmail() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafb'
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(73,156,162,0.08)',
          padding: 40,
          minWidth: 340,
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ width: 80, height: 80, marginBottom: 16 }}>
          <IconLogo />
        </div>
        <h2
          style={{
            fontWeight: 800,
            fontSize: 24,
            margin: '8px 0 0 0',
            color: '#2f2d2f',
            textAlign: 'center'
          }}
        >
          You're in!
        </h2>
        <p style={{ color: '#666', fontSize: 14, margin: '8px 0 24px 0', textAlign: 'center' }}>
          Check your email for a login link. If you don't see it, check your spam folder.
        </p>
        <div style={{ marginTop: 16, fontSize: 13, color: '#979fa2', textAlign: 'center' }}>
          Used the wrong email?{' '}
          <Link href="/auth" style={{ color: '#499ca2', textDecoration: 'underline' }}>
            Enter your email
          </Link>
        </div>
      </div>
    </div>
  );
}
