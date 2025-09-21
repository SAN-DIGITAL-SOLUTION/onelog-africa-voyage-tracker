import { supabase } from '@/lib/supabase';

export async function fetchAdminStats() {
  // À adapter selon la structure réelle
  const [{ count: users }, { count: missions }, { count: notifications }] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('missions').select('*', { count: 'exact', head: true }),
    supabase.from('notifications').select('*', { count: 'exact', head: true }),
  ]);
  // Taux d'envoi fictif pour l'exemple
  return { users, missions, notifications, sendRate: 98 };
}

export async function fetchLogs() {
  const { data } = await supabase.from('logs').select('*').order('timestamp', { ascending: false }).limit(50);
  return data || [];
}

export async function fetchNotificationsSummary() {
  const { data } = await supabase.rpc('notifications_summary');
  return data?.[0] || { total: 0, failed: 0, sent: 0, retrying: 0 };
}

export async function fetchMetricsData() {
  // Récupère le nombre de notifications envoyées par jour sur les 7 derniers jours
  const now = new Date();
  const labels = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  const data: number[] = [];
  for (const date of labels) {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', date + 'T00:00:00.000Z')
      .lt('created_at', date + 'T23:59:59.999Z');
    data.push(count || 0);
  }
  return { labels, data };
}

export function exportMetricsCSV(metrics: { labels: string[]; data: number[] }) {
  const csv = ['Date,Notifications'].concat(metrics.labels.map((l, i) => `${l},${metrics.data[i]}`)).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'metrics.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

// --- Gestion utilisateurs (CRUD) ---
export async function fetchUsers() {
  const { data } = await supabase.from('users').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function createUser(user: { email: string; name: string }) {
  const { data } = await supabase.from('users').insert([user]).select();
  return data?.[0];
}

export async function updateUser(id: string, patch: Partial<{ email: string; name: string }>) {
  const { data } = await supabase.from('users').update(patch).eq('id', id).select();
  return data?.[0];
}

export async function deleteUser(id: string) {
  await supabase.from('users').delete().eq('id', id);
}

export function subscribeToLogs(cb: (log: any) => void) {
  const channel = supabase.channel('logs').on('postgres_changes', { event: '*', schema: 'public', table: 'logs' }, (payload) => {
    cb(payload.new);
  });
  channel.subscribe();
  return () => channel.unsubscribe();
}
