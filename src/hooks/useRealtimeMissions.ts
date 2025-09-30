import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MissionData } from '../services/supervisionService';

export function useRealtimeMissions() {
  const [missions, setMissions] = useState<MissionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();

    // S'abonner aux changements en temps réel
    const subscription = supabase
      .channel('missions-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'missions' },
        (payload) => {
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchMissions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select(`
          *
        `)
        .in('status', ['pending', 'in_progress', 'completed'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      setMissions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeChange = (payload: any) => {
    console.log('Mission change received:', payload);
    fetchMissions(); // Recharger les missions
  };

  return { missions, loading, error, refetch: fetchMissions };
}
