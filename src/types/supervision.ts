// Types pour le module de supervision
export interface VehiclePosition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'maintenance';
  mission?: string;
  driver?: string;
  zone?: string;
  speed?: number;
  heading?: number;
  last_update: string;
}

export interface SupervisionFilters {
  status: string[];
  zone: string[];
  driver: string[];
}

export interface FleetStats {
  total: number;
  active: number;
  idle: number;
  maintenance: number;
  averageSpeed: number;
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface RealtimePositionsHookReturn {
  positions: VehiclePosition[];
  loading: boolean;
  error: string | null;
  connectionStatus: ConnectionStatus;
  refetch: () => void;
}

export interface SupervisionServiceConfig {
  supabaseUrl: string;
  supabaseKey: string;
  enableMockData?: boolean;
  mockUpdateInterval?: number;
}
