// fichier : src/services/chauffeurTracking.ts
import { supabase } from '../integrations/supabase/client';

export async function insertTrackingPoint(missionId: string, latitude: number, longitude: number) {
  const user = supabase.auth.user();
  if (!user) throw new Error('Utilisateur non authentifié');

  const { error } = await supabase
    .from('tracking_points')
    .insert([{ mission_id: missionId, chauffeur_id: user.id, latitude, longitude }]);
  if (error) throw error;
}

export async function getTrackingPoints(missionId: string) {
  const user = supabase.auth.user();
  if (!user) throw new Error('Utilisateur non authentifié');

  const { data, error } = await supabase
    .from('tracking_points')
    .select('*')
    .eq('mission_id', missionId)
    .eq('chauffeur_id', user.id)
    .order('recorded_at', { ascending: true });

  if (error) throw error;
  return data || [];
}
