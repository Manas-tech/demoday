import { useState, useEffect, useRef } from 'react';
import { getUserProfile } from '@lib/db-providers/supabase/auth';
import { createUser } from '@lib/db-providers/supabase';
import useRole, { UserRole } from './use-role';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

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
  const userRef = useRef<User | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    let mounted = true;
    let timeoutId: NodeJS.Timeout | null = null;

    // Set a timeout to ensure loading always resolves (max 10 seconds for production)
    timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('useAuth init - Timeout reached, forcing loading to false');
        setLoading(false);
      }
    }, 10000);

    const initAuth = async () => {
      try {
        // Get Supabase client directly (will be null if not on client-side or not configured)
        const client = getSupabaseClient();
        
        console.log('useAuth init - useSupabase:', useSupabase, 'client:', !!client, 'url:', supabaseUrl ? 'configured' : 'missing');

        if (useSupabase && client) {
          try {
            // Get current session with longer timeout for production
            const sessionPromise = client.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session timeout')), 10000)
            );
            
            const { data: { session }, error } = await Promise.race([
              sessionPromise,
              timeoutPromise
            ]) as any;

            if (error) {
              console.error('Error getting session:', error);
              if (mounted) {
                if (timeoutId) clearTimeout(timeoutId);
                setLoading(false);
              }
              return;
            }
            
            console.log('useAuth init - Session:', session ? 'exists' : 'none', session?.user?.email);
            
            if (session?.user && mounted) {
              try {
                // Get user profile with role (with longer timeout for production)
                const profilePromise = getUserProfile(session.user.id);
                const profileTimeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile timeout')), 8000)
                );
                
                const profile = await Promise.race([
                  profilePromise,
                  profileTimeoutPromise
                ]) as any;

                console.log('useAuth init - Profile:', profile);
                if (profile && mounted) {
                  const userRole = (profile as any).role || 'user';
                  console.log('useAuth init - Setting user with role:', userRole);
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: profile.name || undefined,
                    role: userRole
                  });
                } else if (mounted) {
                  console.log('useAuth init - No profile found, defaulting to user');
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: 'user'
                  });
                }
              } catch (profileError) {
                console.error('Error getting profile (using session only):', profileError);
                // Still set user from session even if profile fails
                if (mounted) {
                  setUser({
                    id: session.user.id,
                    email: session.user.email || '',
                    role: 'user'
                  });
                }
              }
            } else if (mounted) {
              console.log('useAuth init - No session, user not logged in');
              setUser(null);
            }
          } catch (error) {
            console.error('Error initializing auth:', error);
            // Continue to set loading false even on error
          }
        } else if (!useSupabase) {
          console.log('useAuth init - Supabase not configured');
        } else {
          console.log('useAuth init - Supabase client not available');
        }
      } catch (error) {
        console.error('Error in initAuth:', error);
      } finally {
        // Always set loading to false, even if Supabase is not configured
        if (mounted) {
          if (timeoutId) clearTimeout(timeoutId);
          console.log('useAuth init - Setting loading to false');
          setLoading(false);
        }
      }
    };

    // Ensure loading is set to false even if initAuth fails or Supabase is not configured
    initAuth().catch((error) => {
      console.error('initAuth promise rejected:', error);
      if (mounted) {
        if (timeoutId) clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const client = getSupabaseClient();
    if (useSupabase && client) {
      let profileFetchInProgress = false;
      
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        if (!mounted) return;
        
        // If we get a session from auth state change, set loading to false immediately
        if (mounted && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT')) {
          if (timeoutId) clearTimeout(timeoutId);
          setLoading(false);
        }
        
        // Skip INITIAL_SESSION if we already have a user with the same ID (prevents duplicate fetches)
        if (event === 'INITIAL_SESSION' && userRef.current && userRef.current.id === session?.user?.id) {
          console.log('Auth state changed - INITIAL_SESSION but user already set, skipping');
          return;
        }
        
        if (session?.user) {
          // Prevent duplicate profile fetches
          if (profileFetchInProgress) {
            console.log('Profile fetch already in progress, skipping');
            return;
          }
          
          // Skip if we already have this user
          if (userRef.current && userRef.current.id === session.user.id) {
            console.log('User already set with same ID, skipping profile fetch');
            return;
          }
          
          profileFetchInProgress = true;
          
          try {
            // Get user profile with longer timeout for production
            const profilePromise = getUserProfile(session.user.id);
            const profileTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile timeout')), 10000)
            );
            
            const profile = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]) as any;

            if (profile && mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                name: profile.name || undefined,
                role: (profile as any).role || 'user'
              });
            } else if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user'
              });
            }
          } catch (profileError) {
            // Only log if it's not a timeout (timeout is expected in some cases)
            const errorMessage = profileError instanceof Error ? profileError.message : String(profileError);
            if (!errorMessage.includes('timeout')) {
              console.error('Error getting profile in auth change (using session only):', profileError);
            }
            // Still set user from session even if profile fails
            if (mounted) {
              setUser({
                id: session.user.id,
                email: session.user.email || '',
                role: 'user'
              });
            }
          } finally {
            profileFetchInProgress = false;
          }
        } else if (mounted) {
          setUser(null);
        }
      });

      return () => {
        mounted = false;
        if (timeoutId) clearTimeout(timeoutId);
        subscription.unsubscribe();
      };
    } else {
      return () => {
        mounted = false;
        if (timeoutId) clearTimeout(timeoutId);
      };
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (useSupabase) {
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: 'Supabase client not initialized' };
      }
      try {
        const { data, error } = await client.auth.signInWithPassword({
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
              const updateClient = getSupabaseClient();
              if (updateClient) {
                await updateClient
                  .from('users')
                  .update({ role: 'admin' })
                  .eq('id', data.user.id);
                profile = await getUserProfile(data.user.id);
              }
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
      const client = getSupabaseClient();
      if (!client) {
        return { success: false, error: 'Supabase client not initialized' };
      }
      try {
        const { data, error } = await client.auth.signUp({
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
      const client = getSupabaseClient();
      if (client) {
        await client.auth.signOut();
      }
    }
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
  };

  const isLoggedIn = !!user;

  return { user, loading, login, signup, logout, isLoggedIn };
}

