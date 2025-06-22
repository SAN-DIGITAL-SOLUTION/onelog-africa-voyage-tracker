import { supabase } from '@/integrations/supabase/client';
import { Mission, MissionStatus } from '@/types/mission';
import { MissionStatusHistory } from '@/types/mission-status-history';

export async function fetchMissions(): Promise<Mission[]> {
  const { data, error } = await supabase.from('missions').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchMission(id: string): Promise<Mission | null> {
  const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  return data;
}

export async function createMission(mission: Omit<Mission, 'id'>): Promise<Mission> {
  const { data, error } = await supabase.from('missions').insert([mission]).select().single();
  if (error) throw new Error(error.message);
  return data;
}

// Transitions autorisées : draft -> published -> ongoing -> completed
const statusTransitions: Record<MissionStatus, MissionStatus[]> = {
  draft: ['published'],
  published: ['ongoing', 'draft'],
  ongoing: ['completed', 'published'],
  completed: [],
};

export async function updateMission(id: string, mission: Partial<Mission>): Promise<Mission> {
  // Si on souhaite changer le statut, contrôler la transition
  if (mission.status) {
    // Récupérer la mission actuelle
    const { data: current, error: fetchError } = await supabase.from('missions').select('status').eq('id', id).single();
    if (fetchError) throw new Error(fetchError.message);
    const previousStatus = current?.status as MissionStatus;
    if (previousStatus && mission.status !== previousStatus) {
      const allowed = statusTransitions[previousStatus] || [];
      if (!allowed.includes(mission.status as MissionStatus)) {
        throw new Error(`Transition de statut non autorisée : ${previousStatus} → ${mission.status}`);
      }
      // Log dans mission_status_history
      await supabase.from('mission_status_history').insert({
        mission_id: id,
        previous_status: previousStatus,
        new_status: mission.status,
        changed_at: new Date().toISOString(),
        changed_by: 'system', // TODO: remplacer par l'utilisateur courant
      });
    }
  }
  const { data, error } = await supabase.from('missions').update(mission).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function changeMissionStatus(id: string, newStatus: MissionStatus, changedBy: string): Promise<Mission> {
  // Récupérer la mission actuelle
  const { data: current, error: fetchError } = await supabase.from('missions').select('status').eq('id', id).single();
  if (fetchError) throw new Error(fetchError.message);
  const previousStatus = current?.status as MissionStatus;
  const allowed = statusTransitions[previousStatus] || [];
  if (!allowed.includes(newStatus)) {
    throw new Error(`Transition de statut non autorisée : ${previousStatus} → ${newStatus}`);
  }
  // Log dans mission_status_history
  await supabase.from('mission_status_history').insert({
    mission_id: id,
    previous_status: previousStatus,
    new_status: newStatus,
    changed_at: new Date().toISOString(),
    changed_by: changedBy,
  });
  // Mettre à jour la mission
  const { data, error } = await supabase.from('missions').update({ status: newStatus }).eq('id', id).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteMission(id: string): Promise<void> {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
