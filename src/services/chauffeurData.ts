// fichier: src/services/chauffeurData.ts
import { supabase } from '../integrations/supabase/client';

export async function getChauffeurMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_role', 'chauffeur')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getChauffeurNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_role', 'chauffeur')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getFinishedMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_role', 'chauffeur')
    .eq('checked_in', true)
    .eq('checked_out', true)
    .order('check_out_time', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function checkIn(missionId: string) {
  const { error } = await supabase
    .from('missions')
    .update({ checked_in: true, check_in_time: new Date().toISOString() })
    .eq('id', missionId);
  if (error) throw error;
}

export async function checkOut(missionId: string) {
  const { error } = await supabase
    .from('missions')
    .update({ checked_out: true, check_out_time: new Date().toISOString() })
    .eq('id', missionId);
  if (error) throw error;
}
