import { supabase } from '@/integrations/supabase/client';
import { MissionStatusHistory } from '@/types/mission-status-history';

export async function logMissionStatusChange(history: Omit<MissionStatusHistory, 'id'>): Promise<MissionStatusHistory> {
  const { data, error } = await supabase.from('mission_status_history').insert([history]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function fetchStatusHistory(mission_id: string): Promise<MissionStatusHistory[]> {
  const { data, error } = await supabase.from('mission_status_history').select('*').eq('mission_id', mission_id).order('changed_at', { ascending: true });
  if (error) throw new Error(error.message);
  return data || [];
}
