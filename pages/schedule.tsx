import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@components/layout';
import cn from 'classnames';
import { BRAND_COLOR } from '@lib/constants';
import useAuth from '@lib/hooks/use-auth';
import { getSupabaseClient } from '@lib/db-providers/supabase/client';

interface ScheduleItem {
  time: string;
  title: string;
  description?: string;
}

export default function Schedule() {
  const router = useRouter();
  const { isLoggedIn, loading } = useAuth();
  const [checkingSession, setCheckingSession] = useState(true);
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    // If user is already logged in, skip session check
    if (isLoggedIn) {
      setCheckingSession(false);
      return;
    }

    // Wait for auth loading to complete
    if (loading) return;

    const checkAuth = async () => {
      // Check session directly as a fallback
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data: { session } } = await client.auth.getSession();
          if (session?.user) {
            // Session exists, set immediately (auth state will update)
            setCheckingSession(false);
            return;
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      }

      // No session found, redirect to login
      setCheckingSession(false);
      router.replace('/login');
    };

    checkAuth();
  }, [loading, isLoggedIn, router]);

  // Fetch schedule items client-side to get latest updates
  useEffect(() => {
    const fetchScheduleItems = async () => {
      const client = getSupabaseClient();
      if (client) {
        try {
          const { data, error } = await client
            .from('schedule_items')
            .select('*')
            .eq('is_visible', true)
            .order('display_order', { ascending: true });
          
          if (!error && data) {
            const formattedItems = data.map((item: any) => ({
              time: item.time,
              title: item.title,
              description: item.description || undefined
            }));
            setScheduleItems(formattedItems);
          }
        } catch (error) {
          console.error('Error fetching schedule items:', error);
        }
      }
    };

    if (isLoggedIn && !loading) {
      fetchScheduleItems();
      
      // Listen for schedule updates
      const handleScheduleUpdate = () => {
        fetchScheduleItems();
      };
      
      window.addEventListener('schedule-updated', handleScheduleUpdate);
      
      return () => {
        window.removeEventListener('schedule-updated', handleScheduleUpdate);
      };
    }
  }, [isLoggedIn, loading]);

  if (loading || checkingSession) {
    return (
      <Layout>
        <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>
      </Layout>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <Layout>
      <Head>
        <title>Schedule - Virtual Event</title>
        <meta name="description" content="Event schedule and agenda" />
      </Head>
      <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 via-white to-blue-50">
        <div className="py-16 md:py-24">
          <h1 className="text-4xl md:text-6xl font-extrabold text-center mb-12 text-gray-900 tracking-tight drop-shadow-sm">
            Event Schedule
          </h1>
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              {/* Timeline vertical bar */}
              <div
                className="absolute left-4 top-0 bottom-0 w-1 rounded-full"
                style={{
                  zIndex: 0,
                  background: `linear-gradient(to bottom, ${BRAND_COLOR}CC 80%, ${BRAND_COLOR}1A 10%)`
                }}
              />
              <div className="space-y-8 relative z-10">
                {scheduleItems.map((item, index) => (
                  <div
                    key={index}
                    className={cn(
                      'group flex flex-col md:flex-row gap-4 p-6 pl-12 md:pl-16 rounded-xl',
                      'bg-white/90 border border-gray-200 shadow-lg transition-transform duration-200',
                      'hover:scale-[1.02] hover:shadow-2xl relative'
                    )}
                  >
                    <div
                      className="md:w-1/4 font-semibold text-xl flex items-center"
                      style={{ color: BRAND_COLOR }}
                    >
                      {item.time}
                    </div>
                    <div className="md:w-3/4">
                      <h3
                        className="text-2xl font-bold text-gray-900 mb-1 transition-colors group-hover:text-brand"
                        style={{ transition: 'color 0.2s', color: undefined }}
                      >
                        <span className="group-hover:underline" style={{ color: undefined }}>
                          {item.title}
                        </span>
                      </h3>
                      {item.description && (
                        <p className="text-gray-600 text-lg">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {}
  };
};
