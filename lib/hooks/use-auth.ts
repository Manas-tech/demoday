import { useState, useEffect } from 'react';
import { supabase, getUserProfile } from '@lib/db-providers/supabase/auth';
import { createUser } from '@lib/db-providers/supabase';
import useRole, { UserRole } from './use-role';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export type User = {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useSupabase = !!(supabaseUrl && supabaseAnonKey);

export default function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (useSupabase) {
        try {
          // Get current session
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            // Get user profile with role
            const profile = await getUserProfile(session.user.id);
            console.log('useAuth init - Profile:', profile);
            if (profile) {
              const userRole = (profile as any).role || 'user';
              console.log('useAuth init - Setting user with role:', userRole);
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || undefined,
                role: userRole
              });
            } else {
              console.log('useAuth init - No profile found, defaulting to user');
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user'
              });
            }
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        }
      }
      setLoading(false);
    };

    initAuth();

    // Listen for auth changes
    if (useSupabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const profile = await getUserProfile(session.user.id);
          if (profile) {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: profile.name || undefined,
              role: (profile as any).role || 'user'
            });
          } else {
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              role: 'user'
            });
          }
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Ensure user profile exists
          let profile = await getUserProfile(data.user.id);
          
          if (!profile) {
            // Create profile if it doesn't exist
            try {
              await createUser(data.user.id, email);
              profile = await getUserProfile(data.user.id);
            } catch (createError) {
              console.error('Error creating user profile:', createError);
            }
          }
          
          // Auto-set admin role for admin@demo.com if not set
          if (email === 'admin@demo.com' && profile && (profile as any).role !== 'admin') {
            try {
              await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', data.user.id);
              profile = await getUserProfile(data.user.id);
            } catch (updateError) {
              console.error('Error updating admin role:', updateError);
            }
          }
          
          const userRole = (profile as any)?.role || (email === 'admin@demo.com' ? 'admin' : 'user');
          
          setUser({
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || undefined,
            role: userRole
          });
          window.dispatchEvent(new Event('auth-change'));
          return { success: true };
        }
        return { success: false, error: 'Login failed' };
      } catch (error: any) {
        return { success: false, error: error.message || 'Login failed' };
      }
    }
    
    // Fallback to mock (for development without Supabase)
    return { success: false, error: 'Supabase not configured' };
  };

  const signup = async (email: string, password: string, name: string): Promise<{ success: boolean; error?: string }> => {
    if (useSupabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name
            }
          }
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Create user profile in users table
          try {
            await createUser(data.user.id, email, {
              firstName: name.split(' ')[0],
              lastName: name.split(' ').slice(1).join(' ')
            });
            
            // Get the profile to check role
            const profile = await getUserProfile(data.user.id);
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              role: (profile as any)?.role || 'user'
            });
          } catch (profileError) {
            console.error('Error creating user profile:', profileError);
            setUser({
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              role: 'user'
            });
          }
          window.dispatchEvent(new Event('auth-change'));
          return { success: true };
        }
        return { success: false, error: 'Signup failed' };
      } catch (error: any) {
        return { success: false, error: error.message || 'Signup failed' };
      }
    }
    
    // Fallback to mock (for development without Supabase)
    return { success: false, error: 'Supabase not configured' };
  };

  const logout = async () => {
    if (useSupabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  const isLoggedIn = !!user;

  return { user, loading, login, signup, logout, isLoggedIn };
}

