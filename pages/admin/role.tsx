import { useState } from 'react';
import { useRouter } from 'next/router';
import Page from '@components/page';
import Layout from '@components/layout';
import Header from '@components/header';
import useRole from '@lib/hooks/use-role';
import useAuth from '@lib/hooks/use-auth';

export default function RoleManagement() {
  const router = useRouter();
  const { role, updateRole } = useRole();
  const { user, logout } = useAuth();

  const handleRoleChange = (newRole: 'user' | 'admin') => {
    updateRole(newRole);
    alert(`Role changed to ${newRole}. Redirecting...`);
    router.push('/');
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      router.push('/');
    }
  };

  const meta = {
    title: 'Role Management',
    description: 'Change your role'
  };

  return (
    <Page meta={meta}>
      <Layout>
        <Header hero="Role Management" />
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '24px', fontWeight: 700 }}>
              Current Role: <span style={{ color: '#FF7B00' }}>{role}</span>
            </h2>
            <p style={{ marginBottom: '32px', color: '#666' }}>
              Select your role to access different features. Admin users can manage content.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
              <button
                onClick={() => handleRoleChange('user')}
                disabled={role === 'user'}
                style={{
                  padding: '12px 24px',
                  background: role === 'user' ? '#FF7B00' : '#e0e0e0',
                  color: role === 'user' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: role === 'user' ? 'default' : 'pointer',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                User
              </button>
              <button
                onClick={() => handleRoleChange('admin')}
                disabled={role === 'admin'}
                style={{
                  padding: '12px 24px',
                  background: role === 'admin' ? '#FF7B00' : '#e0e0e0',
                  color: role === 'admin' ? '#fff' : '#333',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: role === 'admin' ? 'default' : 'pointer',
                  fontWeight: 600,
                  fontSize: '16px'
                }}
              >
                Admin
              </button>
            </div>
            {user && (
              <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
                <p style={{ marginBottom: '12px', fontSize: '14px', color: '#666' }}>
                  Logged in as: <strong>{user.email}</strong>
                </p>
                <button
                  onClick={handleLogout}
                  style={{
                    padding: '10px 20px',
                    background: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '14px',
                    width: '100%'
                  }}
                >
                  Logout
                </button>
              </div>
            )}
            <p style={{ marginTop: '32px', fontSize: '14px', color: '#999' }}>
              Note: This is a demo. In production, roles would be managed server-side.
            </p>
          </div>
        </div>
      </Layout>
    </Page>
  );
}

