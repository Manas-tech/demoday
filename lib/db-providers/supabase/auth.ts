import { createClient } from '@supabase/supabase-js';
import { ConfUser } from '@lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// In-memory storage for when no database is configured
const memoryStore: {
  profiles: Record<string, ConfUser>;
  sessions: Record<string, any>;
} = {
  profiles: {},
  sessions: {}
};

// Mock Supabase client interface
const createMockSupabase = () => {
  const getCurrentSession = () => {
    if (typeof window === 'undefined') return null;
    const sessionKey = Object.keys(memoryStore.sessions)[0];
    return sessionKey ? { session: memoryStore.sessions[sessionKey] } : { session: null };
  };

  return {
    auth: {
      signInWithOtp: async ({ email }: { email: string }) => {
        console.log('[Mock] Magic link requested for:', email);
        return { data: { user: null }, error: null };
      },
      signInWithOAuth: async () => {
        console.log('[Mock] Google OAuth requested');
        return { data: { url: '#' }, error: null };
      },
      signOut: async () => {
        if (typeof window !== 'undefined') {
          Object.keys(memoryStore.sessions).forEach(key => delete memoryStore.sessions[key]);
        }
        return { error: null };
      },
      getUser: async () => {
        const session = getCurrentSession();
        return { data: { user: session?.session?.user || null }, error: null };
      },
      getSession: async () => getCurrentSession(),
      exchangeCodeForSession: async () => {
        console.log('[Mock] Session exchange requested');
        return { data: { session: null }, error: null };
      },
      onAuthStateChange: (callback: () => void) => {
        return { data: { subscription: { unsubscribe: () => {} } } };
      }
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: null, error: null }),
          single: async () => ({ data: null, error: null })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: async () => ({ data: null, error: null })
            })
          })
        })
      })
    })
  };
};

export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : (createMockSupabase() as any);

const redirectTo = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/callback`
  : 'http://localhost:3000/auth/callback';

export async function signInWithMagicLink(email: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[Mock] Magic link would be sent to:', email);
    return null;
  }
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw error;
  return data.user;
}

export async function signInWithGoogle() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log('[Mock] Google OAuth would be initiated');
    return { url: '#' };
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!supabaseUrl || !supabaseAnonKey) {
    Object.keys(memoryStore.sessions).forEach(key => delete memoryStore.sessions[key]);
    return;
  }
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function updateUserProfile(userId: string, profile: {
  firstname?: string;
  lastname?: string;
  companyname?: string;
  titles?: string[];
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (!memoryStore.profiles[userId]) {
      memoryStore.profiles[userId] = { id: userId };
    }
    memoryStore.profiles[userId] = { ...memoryStore.profiles[userId], ...profile };
    return memoryStore.profiles[userId];
  }
  const { data, error } = await supabase
    .from('users')
    .update(profile)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getUserProfile(userId: string): Promise<ConfUser | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return memoryStore.profiles[userId] || null;
  }
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) throw error;
  return data;
} 