import { useState, useEffect } from 'react';
import useAuth from './use-auth';
import { supabase } from '@lib/db-providers/supabase/auth';

export type UserRole = 'user' | 'admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const useSupabase = !!(supabaseUrl && supabaseAnonKey);

export default function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>('user');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('useRole - User:', user);
    if (user?.role) {
      console.log('useRole - Setting role from user:', user.role);
      setRole(user.role);
      setLoading(false);
    } else if (user) {
      // User exists but no role set, default to 'user'
      console.log('useRole - User exists but no role, defaulting to user');
      setRole('user');
      setLoading(false);
    } else {
      // No user logged in
      console.log('useRole - No user, defaulting to user');
      setRole('user');
      setLoading(false);
    }
  }, [user]);

  const updateRole = async (newRole: UserRole) => {
    setRole(newRole);
    
    if (useSupabase && user?.id) {
      try {
        // Update role in Supabase
        const { error } = await supabase
          .from('users')
          .update({ role: newRole })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating role in Supabase:', error);
        }
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  };

  const isAdmin = role === 'admin';
  const isUser = role === 'user';

  return { role, loading, updateRole, isAdmin, isUser };
}

