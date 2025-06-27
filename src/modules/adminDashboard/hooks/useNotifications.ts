import { useCallback, useEffect, useRef, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [toasts, setToasts] = useState<any[]>([]);
  const toastTimeouts = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Récupère toutes les notifications (ordre décroissant)
  const fetchNotifications = useCallback(async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    setNotifications(data || []);
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // Listener realtime (INSERT)
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload) => {
        const notif = payload.new;
        setNotifications(prev => [notif, ...prev]);
        setToasts(prev => [...prev, notif]);
        // Auto-dismiss après 5s
        if (toastTimeouts.current[notif.id]) clearTimeout(toastTimeouts.current[notif.id]);
        toastTimeouts.current[notif.id] = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== notif.id));
        }, 5000);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const markAsRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return { notifications, unreadCount, markAsRead, toasts };
}
