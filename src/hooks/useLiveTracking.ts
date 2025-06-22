// fichier : src/hooks/useLiveTracking.ts
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

export type TrackingPoint = {
  id: string;
  mission_id: string;
  latitude: number;
  longitude: number;
  created_at: string;
};

export function useLiveTracking(missionId: string) {
  const [points, setPoints] = useState<TrackingPoint[]>([]);

  useEffect(() => {
    // Chargement initial
    supabase
      .from<TrackingPoint>('tracking_points')
      .select('*')
      .eq('mission_id', missionId)
      .order('created_at', { ascending: true })
      .then(({ data }) => { if (data) setPoints(data); });

    // Souscription temps réel
    const channel = supabase
      .channel('live_tracking')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tracking_points', filter: `mission_id=eq.${missionId}` },
        payload => {
          const newPoint = payload.new as TrackingPoint;
          setPoints(prev => [...prev, newPoint]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [missionId]);

  return points;
}
