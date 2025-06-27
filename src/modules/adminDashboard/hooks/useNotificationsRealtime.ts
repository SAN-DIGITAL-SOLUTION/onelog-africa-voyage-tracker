import { useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export function useNotificationsRealtime(onNew: (notif: any) => void) {
  useEffect(() => {
    const sub = supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, payload => {
        onNew(payload.new);
      })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [onNew]);
}
