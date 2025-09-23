import { supabase } from '@/lib/supabase';

export async function fetchUsersPerDay(days = 7) {
  const now = new Date();
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const data: number[] = [];
  for (const date of labels) {
    const { count } = await supabase
      .from('users')
      .select('*', { count: 'exact' })
      .gte('created_at', date + 'T00:00:00.000Z')
      .lt('created_at', date + 'T23:59:59.999Z');
    data.push(count || 0);
  }
  return { labels, data };
}

export async function fetchMissionsPerDay(days = 7) {
  const now = new Date();
  const labels = Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (days - 1 - i));
    return d.toISOString().slice(0, 10);
  });
  const data: number[] = [];
  for (const date of labels) {
    const { count } = await supabase
      .from('missions')
      .select('*', { count: 'exact' })
      .gte('created_at', date + 'T00:00:00.000Z')
      .lt('created_at', date + 'T23:59:59.999Z');
    data.push(count || 0);
  }
  return { labels, data };
}

export function exportCSV(metrics: { labels: string[]; data: number[] }, filename: string) {
  const csv = ['Date,Count'].concat(metrics.labels.map((l, i) => `${l},${metrics.data[i]}`)).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
