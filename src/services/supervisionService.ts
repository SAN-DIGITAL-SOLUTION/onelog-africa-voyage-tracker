import { supabase } from '../integrations/supabase/client';

export interface VehiclePosition {
  id: string;
  vehicle_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  timestamp: string;
  driver_name?: string;
  vehicle_plate?: string;
}

export interface MissionData {
  id: string;
  reference: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  start_address: string;
  end_address: string;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  driver_id?: string;
  vehicle_id?: string;
  client_name: string;
  estimated_start_time: string;
  estimated_end_time: string;
  actual_start_time?: string;
  actual_end_time?: string;
  cargo_weight: number;
  cargo_volume: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface SupervisionData {
  missions: MissionData[];
  vehicles: VehiclePosition[];
  lastUpdate: string;
}

class SupervisionService {
  private static instance: SupervisionService;

  public static getInstance(): SupervisionService {
    if (!SupervisionService.instance) {
      SupervisionService.instance = new SupervisionService();
    }
    return SupervisionService.instance;
  }

  /**
   * Récupère toutes les missions actives avec leurs positions
   */
  async getRealtimeMissions(): Promise<MissionData[]> {
    const { data, error } = await supabase
      .from('missions')
      .select(`
        *,
        client:client_id(name),
        driver:driver_id(name),
        vehicle:vehicle_id(plate_number)
      `)
      .in('status', ['pending', 'in_progress'])
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des missions:', error);
      return [];
    }

    return data.map(mission => ({
      id: mission.id,
      reference: mission.reference,
      status: mission.status,
      start_address: mission.start_address,
      end_address: mission.end_address,
      start_lat: mission.start_lat,
      start_lng: mission.start_lng,
      end_lat: mission.end_lat,
      end_lng: mission.end_lng,
      driver_id: mission.driver_id,
      vehicle_id: mission.vehicle_id,
      client_name: mission.client?.name || 'Client inconnu',
      estimated_start_time: mission.estimated_start_time,
      estimated_end_time: mission.estimated_end_time,
      actual_start_time: mission.actual_start_time,
      actual_end_time: mission.actual_end_time,
      cargo_weight: mission.cargo_weight,
      cargo_volume: mission.cargo_volume,
      priority: mission.priority || 'medium',
    }));
  }

  /**
   * Récupère les positions actuelles de tous les véhicules actifs
   */
  async getRealtimeVehicles(): Promise<VehiclePosition[]> {
    const { data, error } = await supabase
      .from('vehicle_positions')
      .select(`
        *,
        vehicle:vehicle_id(
          plate_number,
          driver:driver_id(name)
        )
      `)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des positions:', error);
      return [];
    }

    // Ne garder que la position la plus récente par véhicule
    const latestPositions = new Map<string, VehiclePosition>();
    data.forEach(pos => {
      const existing = latestPositions.get(pos.vehicle_id);
      if (!existing || new Date(pos.timestamp) > new Date(existing.timestamp)) {
        latestPositions.set(pos.vehicle_id, {
          id: pos.id,
          vehicle_id: pos.vehicle_id,
          latitude: pos.latitude,
          longitude: pos.longitude,
          speed: pos.speed || 0,
          heading: pos.heading || 0,
          timestamp: pos.timestamp,
          driver_name: pos.vehicle?.driver?.name,
          vehicle_plate: pos.vehicle?.plate_number,
        });
      }
    });

    return Array.from(latestPositions.values());
  }

  /**
   * Récupère les données complètes de supervision
   */
  async getSupervisionData(): Promise<SupervisionData> {
    const [missions, vehicles] = await Promise.all([
      this.getRealtimeMissions(),
      this.getRealtimeVehicles(),
    ]);

    return {
      missions,
      vehicles,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * S'abonner aux mises à jour en temps réel via Supabase Realtime
   */
  subscribeToMissions(callback: (mission: MissionData) => void) {
    return supabase
      .channel('missions-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'missions' },
        (payload) => {
          callback(payload.new as MissionData);
        }
      )
      .subscribe();
  }

  /**
   * S'abonner aux mises à jour des positions véhicules
   */
  subscribeToVehicles(callback: (vehicle: VehiclePosition) => void) {
    return supabase
      .channel('vehicles-realtime')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'vehicle_positions' },
        (payload) => {
          callback(payload.new as VehiclePosition);
        }
      )
      .subscribe();
  }

  /**
   * Filtrer les données selon les critères spécifiés
   */
  filterData(data: SupervisionData, filters: {
    missionStatus?: string[];
    vehicleIds?: string[];
    priority?: string[];
    dateRange?: { start: string; end: string };
  }): SupervisionData {
    let filteredMissions = [...data.missions];
    let filteredVehicles = [...data.vehicles];

    if (filters.missionStatus?.length) {
      filteredMissions = filteredMissions.filter(m => 
        filters.missionStatus!.includes(m.status)
      );
    }

    if (filters.vehicleIds?.length) {
      filteredMissions = filteredMissions.filter(m => 
        m.vehicle_id && filters.vehicleIds!.includes(m.vehicle_id)
      );
      filteredVehicles = filteredVehicles.filter(v => 
        filters.vehicleIds!.includes(v.vehicle_id)
      );
    }

    if (filters.priority?.length) {
      filteredMissions = filteredMissions.filter(m => 
        filters.priority!.includes(m.priority)
      );
    }

    if (filters.dateRange) {
      const start = new Date(filters.dateRange.start);
      const end = new Date(filters.dateRange.end);
      
      filteredMissions = filteredMissions.filter(m => {
        const missionStart = new Date(m.estimated_start_time);
        return missionStart >= start && missionStart <= end;
      });
    }

    return {
      missions: filteredMissions,
      vehicles: filteredVehicles,
      lastUpdate: data.lastUpdate,
    };
  }
}

export const supervisionService = SupervisionService.getInstance();
