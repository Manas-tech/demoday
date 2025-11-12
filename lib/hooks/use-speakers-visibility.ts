import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';
import useAuth from './use-auth';

export function useSpeakersVisibility(): boolean {
  const [isVisible, setIsVisible] = useState(true);
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    if (!isLoggedIn || loading) {
      return;
    }

    const fetchVisibility = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('page_settings')
            .select('is_visible')
            .eq('page_key', 'speakers')
            .maybeSingle();
          
          if (!error && data) {
            setIsVisible(data.is_visible !== false); // Default to true if null
          }
        } catch (error) {
          console.error('Error fetching speakers visibility:', error);
        }
      }
    };

    fetchVisibility();

    // Listen for speakers settings updates
    const handleSpeakersSettingsUpdate = () => {
      fetchVisibility();
    };
    
    window.addEventListener('speakers-settings-updated', handleSpeakersSettingsUpdate);
    
    return () => {
      window.removeEventListener('speakers-settings-updated', handleSpeakersSettingsUpdate);
    };
  }, [isLoggedIn, loading]);

  return isVisible;
}

