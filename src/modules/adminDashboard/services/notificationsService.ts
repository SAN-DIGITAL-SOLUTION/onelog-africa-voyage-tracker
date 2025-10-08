import { supabase } from '@/lib/supabase';

export async function getNotifications({ onlyUnread = false, filter = 'all' } = {}) {
  let query = supabase.from('notifications').select('*').order('created_at', { ascending: false });
  if (onlyUnread) query = query.eq('is_read', false);
  if (filter && filter !== 'all') query = query.eq('type', filter);
  const { data } = await query;
  return data || [];
}

export async function markAsRead(id: string) {
  await supabase.from('notifications').update({ is_read: true }).eq('id', id);
}

export async function markAllAsRead() {
  await supabase.from('notifications').update({ is_read: true }).eq('is_read', false);
}
