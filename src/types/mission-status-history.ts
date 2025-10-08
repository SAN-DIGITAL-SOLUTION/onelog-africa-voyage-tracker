import { MissionStatus } from './mission';

export interface MissionStatusHistory {
  id?: string;
  mission_id: string;
  previous_status: MissionStatus;
  new_status: MissionStatus;
  changed_at: string; // ISO date
  changed_by: string; // user id ou email
}
