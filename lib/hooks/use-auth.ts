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

// Global session cache to avoid re-checking on every navigation
let cachedSession: { user: User | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 30 * 1000; // 30 seconds

// Global initialization state to prevent multiple simultaneous initializations
let globalInitInProgress = false;
let globalInitPromise: Promise<void> | null = null;
let globalUserState: User | null = null;
let globalLoadingState = true;
const globalSubscribers = new Set<(user: User | null, loading: boolean) => void>();
let authStateChangeListenerSet = false;

// Notify all subscribers of state changes
function notifySubscribers(user: User | null, loading: boolean) {
  globalUserState = user;
  globalLoadingState = loading;
  globalSubscribers.forEach(callback => callback(user, loading));
}

export default function useAuth() {
  const [user, setUser] = useState<User | null>(globalUserState);
  const [loading, setLoading] = useState(globalLoadingState);
  const userRef = useRef<User | null>(null);
  
  // Keep ref in sync with state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Subscribe to global state changes
  useEffect(() => {
    const subscriber = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser);
      setLoading(newLoading);
    };
    
    globalSubscribers.add(subscriber);
    
    // Set initial state from global
    if (globalUserState !== user) {
      setUser(globalUserState);
    }
    if (globalLoadingState !== loading) {
      setLoading(globalLoadingState);
    }
    
    return () => {
      globalSubscribers.delete(subscriber);
    };
  }, []);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    // If global initialization is already in progress, wait for it
    if (globalInitInProgress && globalInitPromise) {
      globalInitPromise.then(() => {
        // State will be updated via subscriber
      });
      return;
    }

    // If we have a valid cached session, use it immediately
    if (cachedSession && cachedSession.user && Date.now() - cachedSession.timestamp < SESSION_CACHE_DURATION) {
      notifySubscribers(cachedSession.user, false);
      return;
    }

    // Start global initialization (only once)
    if (!globalInitInProgress) {
      globalInitInProgress = true;

      let timeoutId: NodeJS.Timeout | null = null;

      // Set a shorter timeout to ensure loading always resolves quickly (3 seconds)
      timeoutId = setTimeout(() => {
        console.warn('useAuth init - Timeout reached, forcing loading to false');
        notifySubscribers(globalUserState, false);
        globalInitInProgress = false;
        globalInitPromise = null;
      }, 3000);

      globalInitPromise = (async () => {
        try {
          // Check cached session first
          if (cachedSession && Date.now() - cachedSession.timestamp < SESSION_CACHE_DURATION) {
            if (timeoutId) clearTimeout(timeoutId);
            notifySubscribers(cachedSession.user, false);
            globalInitInProgress = false;
            globalInitPromise = null;
            return;
          }

        // Get Supabase client directly (will be null if not on client-side or not configured)
        const client = getSupabaseClient();
        
        console.log('useAuth init - useSupabase:', useSupabase, 'client:', !!client, 'url:', supabaseUrl ? 'configured' : 'missing');

        if (useSupabase && client) {
          try {
            // Get current session with shorter timeout (3 seconds) for faster failure
            const sessionPromise = client.auth.getSession();
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Session timeout')), 3000)
            );
            
            const { data: { session }, error } = await Promise.race([
              sessionPromise,
              timeoutPromise
            ]) as any;

            if (error) {
              // Don't log timeout errors (expected in some cases)
              const errorMessage = error instanceof Error ? error.message : String(error);
              if (!errorMessage.includes('timeout')) {
                console.error('Error getting session:', error);
              }
              // If we have a cached user, preserve it instead of clearing
              if (cachedSession && cachedSession.user && Date.now() - cachedSession.timestamp < SESSION_CACHE_DURATION) {
                console.log('useAuth init - Session check failed but cached user exists, preserving');
                if (timeoutId) clearTimeout(timeoutId);
                notifySubscribers(cachedSession.user, false);
                globalInitInProgress = false;
                globalInitPromise = null;
                return;
              } else {
                // Only cache null session if we don't have a valid cached user
                cachedSession = { user: null, timestamp: Date.now() };
              }
              if (timeoutId) clearTimeout(timeoutId);
              notifySubscribers(null, false);
              globalInitInProgress = false;
              globalInitPromise = null;
              return;
            }
            
            console.log('useAuth init - Session:', session ? 'exists' : 'none', session?.user?.email);
            
            if (session?.user) {
              // Determine default role based on email (for admin users)
              const defaultRole = (session.user.email === 'admin@demo.com' || session.user.email === 'testadmin@demo.com') ? 'admin' : 'user';
              
              try {
                // Get user profile with shorter timeout (3 seconds) for faster failure
                const profilePromise = getUserProfile(session.user.id);
                const profileTimeoutPromise = new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Profile timeout')), 3000)
                );
                
                const profile = await Promise.race([
                  profilePromise,
                  profileTimeoutPromise
                ]) as any;

                console.log('useAuth init - Profile:', profile);
                const userRole = profile ? ((profile as any).role || defaultRole) : defaultRole;
                const finalUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  name: profile?.name || undefined,
                  role: userRole
                };
                
                console.log('useAuth init - Setting user with role:', userRole);
                // Cache the user to avoid re-checking on navigation
                cachedSession = { user: finalUser, timestamp: Date.now() };
                if (timeoutId) clearTimeout(timeoutId);
                notifySubscribers(finalUser, false);
                globalInitInProgress = false;
                globalInitPromise = null;
              } catch (profileError) {
                // Don't log timeout errors (expected in some cases)
                const errorMessage = profileError instanceof Error ? profileError.message : String(profileError);
                if (!errorMessage.includes('timeout')) {
                  console.error('Error getting profile (using session only):', profileError);
                }
                // Still set user from session even if profile fails
                // Use default role based on email
                const finalUser: User = {
                  id: session.user.id,
                  email: session.user.email || '',
                  role: defaultRole
                };
                console.log('useAuth init - Profile fetch failed, using default role:', defaultRole);
                // Cache the user to avoid re-checking on navigation
                cachedSession = { user: finalUser, timestamp: Date.now() };
                if (timeoutId) clearTimeout(timeoutId);
                notifySubscribers(finalUser, false);
                globalInitInProgress = false;
                globalInitPromise = null;
              }
            } else {
              // Only clear user if we don't have a cached session
              // This prevents clearing the user during navigation when session check fails
              if (!cachedSession || !cachedSession.user) {
                console.log('useAuth init - No session, user not logged in');
                // Cache null session to avoid repeated checks
                cachedSession = { user: null, timestamp: Date.now() };
                if (timeoutId) clearTimeout(timeoutId);
                notifySubscribers(null, false);
              } else {
                // Preserve cached user if session check fails (might be temporary)
                console.log('useAuth init - No session but cached user exists, preserving');
                if (timeoutId) clearTimeout(timeoutId);
                notifySubscribers(cachedSession.user, false);
              }
              globalInitInProgress = false;
              globalInitPromise = null;
            }
          } catch (error) {
            console.error('Error initializing auth:', error);
            // Continue to set loading false even on error
            if (timeoutId) clearTimeout(timeoutId);
            notifySubscribers(globalUserState, false);
            globalInitInProgress = false;
            globalInitPromise = null;
          }
        } else if (!useSupabase) {
          console.log('useAuth init - Supabase not configured');
          if (timeoutId) clearTimeout(timeoutId);
          notifySubscribers(null, false);
          globalInitInProgress = false;
          globalInitPromise = null;
        } else {
          console.log('useAuth init - Supabase client not available');
          if (timeoutId) clearTimeout(timeoutId);
          notifySubscribers(null, false);
          globalInitInProgress = false;
          globalInitPromise = null;
        }
        } catch (error) {
          console.error('Error in initAuth:', error);
          if (timeoutId) clearTimeout(timeoutId);
          notifySubscribers(globalUserState, false);
          globalInitInProgress = false;
          globalInitPromise = null;
        }
      })();

      return () => {
        // Cleanup handled by global state
      };
    }

    // Listen for auth changes (only set up once globally)
    const client = getSupabaseClient();
    if (useSupabase && client && !authStateChangeListenerSet) {
      authStateChangeListenerSet = true;
      let profileFetchInProgress = false;
      
      const { data: { subscription } } = client.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        // If we get a session from auth state change, set loading to false immediately
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'SIGNED_OUT') {
          notifySubscribers(globalUserState, false);
        }
        
        // Skip INITIAL_SESSION events entirely if we already have a cached user (prevents duplicate fetches)
        if (event === 'INITIAL_SESSION') {
          if (userRef.current && userRef.current.id === session?.user?.id) {
            console.log('Auth state changed - INITIAL_SESSION but user already set, skipping');
            return;
          }
          // Also skip if we have a recent cached session
          if (cachedSession && Date.now() - cachedSession.timestamp < SESSION_CACHE_DURATION) {
            console.log('Auth state changed - INITIAL_SESSION but cached session exists, skipping');
            return;
          }
        }
        
        if (session?.user) {
          // Prevent duplicate profile fetches
          if (profileFetchInProgress) {
            console.log('Profile fetch already in progress, skipping');
            return;
          }
          
          // Skip if we already have this user with correct role
          if (userRef.current && userRef.current.id === session.user.id) {
            // Only skip if we have a role set (not defaulting)
            if (userRef.current.role && userRef.current.role !== 'user') {
              console.log('User already set with same ID and role, skipping profile fetch');
              return;
            }
          }
          
          profileFetchInProgress = true;
          
          // Determine default role based on email (for admin users)
          const defaultRole = (session.user.email === 'admin@demo.com' || session.user.email === 'testadmin@demo.com') ? 'admin' : 'user';
          
          try {
            // Get user profile with shorter timeout (3 seconds) for faster failure
            const profilePromise = getUserProfile(session.user.id);
            const profileTimeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Profile timeout')), 3000)
            );
            
            const profile = await Promise.race([
              profilePromise,
              profileTimeoutPromise
            ]) as any;

            const userRole = profile ? ((profile as any).role || defaultRole) : defaultRole;
            const finalUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: profile?.name || undefined,
              role: userRole
            };
            
            // Cache the user to avoid re-checking on navigation
            cachedSession = { user: finalUser, timestamp: Date.now() };
            notifySubscribers(finalUser, false);
          } catch (profileError) {
            // Only log if it's not a timeout (timeout is expected in some cases)
            const errorMessage = profileError instanceof Error ? profileError.message : String(profileError);
            if (!errorMessage.includes('timeout')) {
              console.error('Error getting profile in auth change (using session only):', profileError);
            }
            // Still set user from session even if profile fails
            // Preserve existing role if available, otherwise use default based on email
            const existingRole = globalUserState?.role;
            const finalRole = existingRole && existingRole !== 'user' ? existingRole : defaultRole;
            const finalUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: finalRole
            };
            // Cache the user to avoid re-checking on navigation
            cachedSession = { user: finalUser, timestamp: Date.now() };
            notifySubscribers(finalUser, false);
          } finally {
            profileFetchInProgress = false;
          }
        } else {
          // Only clear user if it's an explicit SIGNED_OUT event
          // Don't clear on null session during navigation (session might be temporarily null)
          if (event === 'SIGNED_OUT') {
            // Cache null session to avoid repeated checks
            cachedSession = { user: null, timestamp: Date.now() };
            notifySubscribers(null, false);
          } else if (event === 'INITIAL_SESSION' && !session) {
            // Only clear on INITIAL_SESSION with no session if we don't have a cached session
            if (!cachedSession || !cachedSession.user) {
              cachedSession = { user: null, timestamp: Date.now() };
              notifySubscribers(null, false);
            } else {
              // Preserve cached user if session is temporarily null
              console.log('Auth state changed - Session null but cached user exists, preserving');
              notifySubscribers(cachedSession.user, false);
            }
          } else if (!session && globalUserState) {
            // If session is null but we have a user, preserve it (might be temporary)
            // Only clear if we have no cached session
            if (!cachedSession || !cachedSession.user) {
              cachedSession = { user: null, timestamp: Date.now() };
              notifySubscribers(null, false);
            }
          }
        }
      });
    }
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Hardcoded admin user (works even without Supabase)
    // Accept both 'testadmin' and 'testadmin@demo.com' as email
    if ((email === 'testadmin' || email === 'testadmin@demo.com') && password === 'admin123') {
      const hardcodedAdmin: User = {
        id: 'hardcoded-admin-id',
        email: 'testadmin@demo.com',
        name: 'Test Admin',
        role: 'admin'
      };
      // Cache the user to avoid re-checking on navigation
      cachedSession = { user: hardcodedAdmin, timestamp: Date.now() };
      notifySubscribers(hardcodedAdmin, false);
      window.dispatchEvent(new Event('auth-change'));
      return { success: true };
    }

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
          
          // Auto-set admin role for admin@demo.com or testadmin if not set
          if ((email === 'admin@demo.com' || email === 'testadmin@demo.com') && profile && (profile as any).role !== 'admin') {
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
          
          const finalUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || undefined,
            role: userRole
          };
          // Cache the user to avoid re-checking on navigation
          cachedSession = { user: finalUser, timestamp: Date.now() };
          notifySubscribers(finalUser, false);
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
            const finalUser: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              role: (profile as any)?.role || 'user'
            };
            // Cache the user to avoid re-checking on navigation
            cachedSession = { user: finalUser, timestamp: Date.now() };
            notifySubscribers(finalUser, false);
          } catch (profileError) {
            console.error('Error creating user profile:', profileError);
            const finalUser: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: name,
              role: 'user'
            };
            // Cache the user to avoid re-checking on navigation
            cachedSession = { user: finalUser, timestamp: Date.now() };
            notifySubscribers(finalUser, false);
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
    // Clear cached session
    cachedSession = { user: null, timestamp: Date.now() };
    notifySubscribers(null, false);
    window.dispatchEvent(new Event('auth-change'));
  };

  const isLoggedIn = !!user;

  return { user, loading, login, signup, logout, isLoggedIn };
}

