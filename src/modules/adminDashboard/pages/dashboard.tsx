import DashboardLayout from '../components/DashboardLayout';
import StatsCard from '../components/StatsCard';
import NotificationSummary from '../components/NotificationSummary';
import useAdminStats from '../hooks/useAdminStats';
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

import { GetServerSidePropsContext } from 'next';
import { createClient } from '@supabase/supabase-js';

export default function AdminDashboardPage() {
  const stats = useAdminStats();
  return (
    <DashboardLayout>
      <h1>Vue générale du système</h1>
      <div style={{ display: 'flex', gap: 24 }}>
        <StatsCard title="Utilisateurs" value={stats.users} />
        <StatsCard title="Missions" value={stats.missions} />
        <StatsCard title="Notifications" value={stats.notifications} />
        <StatsCard title="Taux d'envoi" value={stats.sendRate + '%'} />
      </div>
      <NotificationSummary />
      <div style={{ marginTop: 32 }}>
        <h2>Analytics avancés</h2>
        <AnalyticsDashboard />
      </div>
    </DashboardLayout>
  );
}

export async function getServerSideProps(ctx: GetServerSidePropsContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);
  const token = ctx.req.cookies['sb-access-token'];
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role_id, roles(name)')
    .eq('user_id', user.id);
  const roleNames = (roles || []).map((r: any) => r.roles?.name).filter(Boolean);
  if (!roleNames.includes('admin')) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  return { props: {} };
}
