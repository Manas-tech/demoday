import React, { useState } from 'react';
import { useRouter } from 'next/router';
import IconLogo from '@components/icons/icon-logo';
import IconGoogle from '@components/icons/icon-google';
import useAuth from '@lib/hooks/use-auth';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      let result;
      if (isSignup) {
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        result = await signup(email, password, name);
      } else {
        result = await login(email, password);
      }

      if (result.success) {
        setMessage(isSignup ? 'Account created successfully!' : 'Login successful!');
        setTimeout(() => {
          router.push('/');
        }, 1000);
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
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
        background: '#F8F8F8',
        padding: '20px'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          background: '#fff',
          borderRadius: 16,
          boxShadow: '0 2px 16px rgba(0,0,0,0.1)',
          padding: 40,
          minWidth: 340,
          maxWidth: 360,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div style={{ width: 160, height: 160, marginBottom: 8 }}>
          <IconLogo />
        </div>
        <h2
          style={{
            fontWeight: 800,
            fontSize: 24,
            margin: '8px 0 0 0',
            color: '#2f2d2f',
            textAlign: 'center',
            lineHeight: 1.2
          }}
        >
          WELCOME TO MARL
          <br />
          DEMO DAY!
        </h2>
        <p style={{ color: '#666', fontSize: 14, margin: '8px 0 24px 0', textAlign: 'center' }}>
          {isSignup
            ? 'Create an account to access the event'
            : 'Please enter your email and password to login.'}
        </p>

        {isSignup && (
          <input
            type="text"
            placeholder="Enter your name"
            value={name}
            onChange={e => setName(e.target.value)}
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
        )}

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

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={e => setPassword(e.target.value)}
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
          onMouseOver={e => {
            if (!loading) e.currentTarget.style.background = '#e86e00';
          }}
          onMouseOut={e => {
            if (!loading) e.currentTarget.style.background = '#FF7B00';
          }}
        >
          {loading ? 'Please wait...' : isSignup ? 'Sign Up' : 'Login'}
        </button>

        <button
          type="button"
          onClick={() => setIsSignup(!isSignup)}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#666',
            fontWeight: 500,
            fontSize: 14,
            border: 'none',
            padding: '8px 0',
            marginBottom: 12,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          {isSignup ? 'Already have an account? Login' : "Don't have an account? Sign up"}
        </button>

        {error && (
          <div style={{ color: '#dc3545', marginTop: 8, textAlign: 'center', fontSize: 14, width: '100%' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ color: '#28a745', marginTop: 8, textAlign: 'center', fontSize: 14, width: '100%' }}>
            {message}
          </div>
        )}

        <div
          style={{
            marginTop: 24,
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: 8,
            fontSize: 12,
            color: '#666',
            width: '100%'
          }}
        >
          <strong>Demo Credentials:</strong>
          <br />
          User: user@demo.com / user123
          <br />
          Admin: admin@demo.com / admin123
        </div>

        <p
          style={{
            fontSize: 12,
            color: '#666',
            marginTop: 16,
            marginBottom: 0,
            textAlign: 'center',
            lineHeight: 1.4
          }}
        >
          By signing in, you agree to our{' '}
          <a
            href="/terms"
            target="_blank"
            style={{ color: '#FF7B00', textDecoration: 'underline' }}
          >
            Terms of Service
          </a>{' '}
          and{' '}
          <a
            href="/privacy"
            target="_blank"
            style={{ color: '#FF7B00', textDecoration: 'underline' }}
          >
            Privacy Policy
          </a>
        </p>
      </form>
    </div>
  );
}

