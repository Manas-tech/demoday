import React, { useState, useEffect } from 'react';
import IconLogo from '@components/icons/icon-logo';
import { useRouter } from 'next/router';
import { updateUserProfile, getUserProfile } from '@lib/db-providers/supabase/auth';
import { createUser } from '@lib/db-providers/supabase';
import useSupabaseUser from '@lib/hooks/use-supabase-user';

const TITLE_OPTIONS = ['Founder', 'Investor', 'Mentor', 'Corporate', 'Other'];

export default function CompleteProfile() {
  const { user, loading } = useSupabaseUser();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [titles, setTitles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user && user.id) {
      getUserProfile(user.id).then(profile => {
        if (profile) {
          setFirstName(profile.firstname || '');
          setLastName(profile.lastname || '');
          setCompanyName(profile.companyname || '');
          setTitles(profile.titles || []);
        } else {
          setFirstName('');
          setLastName('');
          setCompanyName('');
          setTitles([]);
        }
      });
    }
  }, [user]);

  if (loading) return null;
  if (!user) {
    router.replace('/auth');
    return null;
  }

  const handleTitleChange = (option: string) => {
    setTitles(prev => (prev.includes(option) ? prev.filter(t => t !== option) : [...prev, option]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      if (!user.id) throw new Error('User ID is missing');
      console.log('user.id:', user.id);
      let profile = await getUserProfile(user.id);
      if (!profile) {
        if (!user.email) throw new Error('User email is missing');
        console.log('Profile row missing, creating user row...');
        try {
          await createUser(user.id, user.email, {
            firstName: '',
            lastName: '',
            companyName: '',
            titles: []
          });
        } catch (err: any) {
          if (err.message && err.message.includes('duplicate key')) {
            // Row already exists, ignore
            console.log('Duplicate key error on insert, row already exists. Proceeding to update.');
          } else {
            throw err;
          }
        }
      }
      const updatePayload = {
        firstname: firstName,
        lastname: lastName,
        companyname: companyName,
        titles: titles
      };
      console.log('Calling updateUserProfile with:', updatePayload);
      await updateUserProfile(user.id, updatePayload);
      setMessage('Profile updated!');
      setTimeout(() => router.replace('/'), 1000);
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile. Please try again.');
    }
    setSubmitting(false);
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
        onSubmit={handleSubmit}
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
          Complete Your Profile
        </h2>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={e => setFirstName(e.target.value)}
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
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={e => setLastName(e.target.value)}
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
          type="text"
          placeholder="Firm"
          value={companyName}
          onChange={e => setCompanyName(e.target.value)}
          required
          style={{
            width: '100%',
            padding: '12px 10px',
            borderRadius: 8,
            border: '1px solid #c9d1d3',
            marginBottom: 24,
            fontSize: 16
          }}
        />
        <div style={{ width: '100%', marginBottom: 24 }}>
          <label style={{ fontWeight: 600, marginBottom: 8, display: 'block', color: '#2f2d2f' }}>
            Your Role(s)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {TITLE_OPTIONS.map(option => (
              <button
                type="button"
                key={option}
                onClick={() => handleTitleChange(option)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 16,
                  border: titles.includes(option) ? '2px solid #FF7B00' : '1px solid #c9d1d3',
                  background: titles.includes(option) ? '#FFF3E6' : '#fff',
                  color: '#2f2d2f',
                  fontWeight: 500,
                  cursor: 'pointer',
                  outline: 'none',
                  fontSize: 15,
                  transition: 'background 0.2s, border 0.2s'
                }}
                onMouseOver={e => {
                  if (titles.includes(option)) {
                    e.currentTarget.style.background = '#FFE0BF';
                  } else {
                    e.currentTarget.style.background = '#f5f5f5';
                  }
                }}
                onMouseOut={e => {
                  if (titles.includes(option)) {
                    e.currentTarget.style.background = '#FFF3E6';
                  } else {
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                {option}
                {titles.includes(option) && (
                  <span style={{ marginLeft: 6, color: '#FF7B00' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={submitting}
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
            cursor: submitting ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
            boxShadow: '0 2px 8px rgba(255,123,0,0.08)',
            outline: 'none'
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#e86e00')}
          onMouseOut={e => (e.currentTarget.style.background = '#FF7B00')}
        >
          {submitting ? 'Saving...' : 'Complete Profile'}
        </button>
        {message && (
          <div style={{ color: '#b6ce4b', marginTop: 8, textAlign: 'center' }}>{message}</div>
        )}
      </form>
    </div>
  );
}
