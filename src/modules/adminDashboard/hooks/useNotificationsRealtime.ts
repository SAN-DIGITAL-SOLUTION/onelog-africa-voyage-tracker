import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

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
