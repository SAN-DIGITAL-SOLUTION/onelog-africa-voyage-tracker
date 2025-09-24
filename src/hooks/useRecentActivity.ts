import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export type Activity = {
  id: string;
  type: 'nouvelle_demande' | 'mission_terminee' | 'chauffeur_disponible';
  description: string;
  timestamp: string;
  metadata?: Record<string, any>;
};

export function useRecentActivity(limit = 5) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        setLoading(true);

        const { data: demandesData, error: demandesError } = await supabase
          .from('demandes')
          .select('id, created_at, lieu_depart, lieu_arrivee')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (demandesError) throw new Error(`Erreur demandes: ${demandesError.message}`);

        const { data: missionsData, error: missionsError } = await supabase
          .from('missions')
          .select('id, updated_at, statut')
          .in('statut', ['terminee'])
          .order('updated_at', { ascending: false })
          .limit(limit);

        if (missionsError) throw new Error(`Erreur missions: ${missionsError.message}`);

        const demandeActivities: Activity[] = (demandesData || []).map(d => ({
          id: `demande-${d.id}`,
          type: 'nouvelle_demande',
          description: `Transport ${d.lieu_depart}-${d.lieu_arrivee}`,
          timestamp: d.created_at,
        }));

        const missionActivities: Activity[] = (missionsData || []).map(m => ({
          id: `mission-${m.id}`,
          type: 'mission_terminee',
          description: `Livraison terminée`,
          timestamp: m.updated_at,
        }));

        const combinedActivities = [...demandeActivities, ...missionActivities]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, limit);

        setActivities(combinedActivities);

      } catch (err: any) {
        setError(err.message);
        console.error("Erreur lors de la récupération de l'activité récente:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivity();

    const subscription = supabase
      .channel('public:demandes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'demandes' }, fetchRecentActivity)
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };

  }, [limit]);

  return { activities, loading, error };
}
