export type MissionStatus = 'draft' | 'published' | 'ongoing' | 'completed';
export type MissionPriority = 'low' | 'medium' | 'high';

export interface Mission {
  id?: string;
  ref: string;
  title: string;
  client: string;
  chauffeur?: string;
  status: MissionStatus;
  start_date?: string; // ISO date
  end_date?: string;   // ISO date
  date?: string; // date de la mission (legacy ?)
  description?: string;
  priority: MissionPriority;
  poids?: number;
  volume?: number;
  type_de_marchandise?: string;
  lieu_enlevement?: string;
  lieu_livraison?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}
