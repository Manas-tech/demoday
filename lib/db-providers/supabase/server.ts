import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let serverSupabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for server-side use (getStaticProps, API routes, etc.)
 * This client doesn't use localStorage and can be used in Node.js environment
 */
export function getSupabaseServerClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  // Return existing client if already created (singleton pattern)
  if (serverSupabaseClient) {
    return serverSupabaseClient;
  }

  // Create new client for server-side use
  serverSupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return serverSupabaseClient;
}

