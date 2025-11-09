import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { supabase, getUserProfile } from '@lib/db-providers/supabase/auth';
import { createUser } from '@lib/db-providers/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    async function handleAuth() {
      try {
        // This exchanges the code in the URL for a session (Supabase v2)
        // If no Supabase is configured, this will use the mock which returns null
        await supabase.auth.exchangeCodeForSession(window.location.href);
        const { data } = await supabase.auth.getSession();
        const user = data?.session?.user;
        
        // If no user (no database configured or auth failed), redirect to home
        if (!user) {
          router.replace('/');
          return;
        }

        let profile = null;
        try {
          // First try to get profile by user ID
          profile = await getUserProfile(user.id);
          console.log('Fetched profile by ID:', profile);

          // If no profile found by ID, try to find by email (only if Supabase is configured)
          if (!profile && user.email) {
            try {
              const { data: existingUser } = await supabase
                .from('users')
                .select('*')
                .eq('email', user.email)
                .maybeSingle();

              if (existingUser) {
                console.log('Found existing user by email:', existingUser);
                profile = existingUser;
              }
            } catch (e) {
              // Supabase might not be configured, ignore
              console.log('Could not query users table (Supabase may not be configured)');
            }
          }
        } catch (e) {
          console.error('Error fetching profile:', e);
          profile = null;
        }

        if (!profile) {
          // Create a new user row in your users table
          try {
            if (!user.email) throw new Error('User email is missing');
            await createUser(user.id, user.email);
            console.log('Profile created for user:', user.id);
            router.replace('/auth/complete-profile');
            return;
          } catch (err: any) {
            console.error('Error creating profile:', err);
            // If we get a duplicate key error, try to fetch the existing user
            if (err.message && err.message.includes('duplicate key')) {
              try {
                const { data: existingUser } = await supabase
                  .from('users')
                  .select('*')
                  .eq('email', user.email)
                  .maybeSingle();
                if (existingUser) {
                  profile = existingUser;
                }
              } catch (e) {
                // Ignore
              }
            }
          }
        }

        // Check if profile is complete
        if (profile) {
          if (
            !profile.firstname ||
            profile.firstname.trim() === '' ||
            !profile.lastname ||
            profile.lastname.trim() === '' ||
            !profile.companyname ||
            profile.companyname.trim() === ''
          ) {
            router.replace('/auth/complete-profile');
          } else {
            router.replace('/');
          }
        } else {
          // No profile and couldn't create one - redirect to complete profile
          router.replace('/auth/complete-profile');
        }
      } catch (error) {
        console.error('Auth error:', error);
        // On error, just redirect to home
        router.replace('/');
      }
    }

    handleAuth();
  }, [router]);

  return <p>Signing you in...</p>;
}
