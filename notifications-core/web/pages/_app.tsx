import type { AppProps } from 'next/app';
import '../styles/globals.css';
import { Layout } from '../components/Layout';
import { SupabaseProvider } from '@supabase/auth-helpers-react';
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';

import NotificationToast from '../../src/modules/adminDashboard/components/NotificationToast';
import { useNotifications } from '../../src/modules/adminDashboard/hooks/useNotifications';

function MyApp({ Component, pageProps }: AppProps) {
  const [supabaseClient] = useState(() => createBrowserSupabaseClient());
  const { toasts } = useNotifications();
  return (
    <SupabaseProvider supabaseClient={supabaseClient}>
      <NotificationToast toasts={toasts} />
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </SupabaseProvider>
  );
}

export default MyApp;
