import { useEffect, useState } from 'react';
import { supabase } from '@lib/db-providers/supabase/auth';
import { ConfUser } from '@lib/types';

export default function useSupabaseUser() {
  const [user, setUser] = useState<ConfUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setUser(data?.user ?? null);
      } catch (error) {
        console.error('Error getting user:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  return { user, loading };
} 