import React, { useState } from 'react';
import IconLogo from '@components/icons/icon-logo';
import IconGoogle from '@components/icons/icon-google';
import { signInWithMagicLink, signInWithGoogle } from '@lib/db-providers/supabase/auth';
import { useRouter } from 'next/router';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await signInWithMagicLink(email);
      router.push('/auth/check-email');
    } catch (err) {
      setMessage('Failed to send magic link. Please try again.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    setMessage('');
    try {
      await signInWithGoogle();
      // Supabase will redirect automatically
    } catch (err) {
      setMessage('Google sign-in failed. Please try again.');
      setLoading(false);
    }
  };

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
      <form
        onSubmit={handleMagicLink}
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
        <div style={{ width: 160, height: 160 }}>
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
          Welcome to MARL Demo Day!
        </h2>
        <p style={{ color: '#666', fontSize: 14, margin: '8px 0 24px 0', textAlign: 'center' }}>
          Please enter your email to receive a one-time login link.
        </p>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 10px',
            borderRadius: 8,
            border: '1px solid #c9d1d3',
            marginBottom: 16,
            fontSize: 16
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            background: '#FF7B00',
            color: '#fff',
            fontWeight: 700,
            fontSize: 16,
            border: 'none',
            borderRadius: 8,
            padding: '12px 0',
            marginBottom: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(255,123,0,0.08)',
            outline: 'none'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#e86e00')}
          onMouseOut={e => (e.currentTarget.style.background = '#FF7B00')}
        >
          {loading ? 'Sending...' : 'Send Magic Link'}
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: '100%',
            background: '#fff',
            color: '#FF7B00',
            fontWeight: 700,
            fontSize: 16,
            border: '2px solid #FF7B00',
            borderRadius: 8,
            padding: '12px 0',
            marginBottom: 12,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(255,123,0,0.04)',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#FFF3E6')}
          onMouseOut={e => (e.currentTarget.style.background = '#fff')}
        >
          <IconGoogle />
          Sign in with Google
        </button>
        {message && (
          <div style={{ color: '#499ca2', marginTop: 8, textAlign: 'center' }}>{message}</div>
        )}
        {/* <div style={{ marginTop: 16, fontSize: 13, color: '#979fa2', textAlign: 'center' }}>
          Need access? Please contact the{' '}
          <a
            href="mailto:info@marlaccelerator.com"
            style={{ color: '#499ca2', textDecoration: 'underline' }}
          >
            MARL team
          </a>
          .
        </div> */}
        <p
          style={{
            fontSize: 12,
            color: '#666',
            marginBottom: 16,
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          By signing in, you agree to our{' '}
          <a
            href="/terms"
            target="_blank"
            style={{ color: '#499ca2', textDecoration: 'underline' }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            target="_blank"
            style={{ color: '#499ca2', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}
