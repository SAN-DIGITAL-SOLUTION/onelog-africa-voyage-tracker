import { supabase } from '@/lib/supabase';

export interface VehiclePosition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'maintenance';
  mission?: string;
  driver?: string;
  lastUpdate: string;
  zone?: string;
  speed?: number;
  heading?: number;
}

export interface SupervisionFilters {
  status: string[];
  zone: string[];
  driver: string[];
}

class SupervisionService {
  private wsConnection: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  /**
   * Récupère les positions actuelles des véhicules
   */
  async getPositions(): Promise<VehiclePosition[]> {
    try {
      const { data, error } = await supabase
        .from('vehicle_positions')
        .select(`
          id,
          name,
          lat,
          lng,
          status,
          mission,
          driver,
          zone,
          speed,
          heading,
          last_update
        `)
        .order('last_update', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des positions:', error);
        throw new Error(`Erreur API: ${error.message}`);
      }

      return (data || []).map(item => ({
        id: item.id,
        name: item.name,
        lat: item.lat,
        lng: item.lng,
        status: item.status,
        mission: item.mission,
        driver: item.driver,
        zone: item.zone,
        speed: item.speed,
        heading: item.heading,
        lastUpdate: new Date(item.last_update).toLocaleString('fr-FR'),
      }));
    } catch (error) {
      console.error('Erreur SupervisionService.getPositions:', error);
      throw error;
    }
  }

  /**
   * Établit une connexion WebSocket pour les mises à jour temps réel
   */
  connectRealtime(onPositionUpdate: (positions: VehiclePosition[]) => void): () => void {
    // Utilisation du canal Supabase Realtime
    const channel = supabase
      .channel('realtime/v1')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_positions'
        },
        async (payload) => {
          console.log('Mise à jour temps réel reçue:', payload);
          
          // Récupérer toutes les positions mises à jour
          try {
            const updatedPositions = await this.getPositions();
            onPositionUpdate(updatedPositions);
          } catch (error) {
            console.error('Erreur lors de la mise à jour temps réel:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Statut connexion Realtime:', status);
      });

    // Fonction de nettoyage
    return () => {
      supabase.removeChannel(channel);
    };
  }

  /**
   * Simule des données de test pour le développement
   */
  getMockPositions(): VehiclePosition[] {
    return [
      {
        id: 'truck-001',
        name: 'Camion Dakar-01',
        lat: 14.6937,
        lng: -17.4441,
        status: 'active',
        mission: 'Livraison Thiès',
        driver: 'Amadou Ba',
        zone: 'dakar',
        speed: 65,
        heading: 45,
        lastUpdate: new Date().toLocaleString('fr-FR'),
      },
      {
        id: 'truck-002',
        name: 'Camion Thiès-02',
        lat: 14.7886,
        lng: -16.9268,
        status: 'idle',
        mission: 'En attente',
        driver: 'Moussa Diop',
        zone: 'thies',
        speed: 0,
        heading: 0,
        lastUpdate: new Date(Date.now() - 300000).toLocaleString('fr-FR'),
      },
      {
        id: 'truck-003',
        name: 'Camion Kaolack-03',
        lat: 14.1594,
        lng: -16.0733,
        status: 'maintenance',
        mission: 'Maintenance préventive',
        driver: 'Ibrahima Fall',
        zone: 'kaolack',
        speed: 0,
        heading: 0,
        lastUpdate: new Date(Date.now() - 1800000).toLocaleString('fr-FR'),
      },
      {
        id: 'truck-004',
        name: 'Camion Saint-Louis-04',
        lat: 16.0179,
        lng: -16.4896,
        status: 'active',
        mission: 'Transport marchandises',
        driver: 'Fatou Sow',
        zone: 'saint-louis',
        speed: 72,
        heading: 180,
        lastUpdate: new Date(Date.now() - 120000).toLocaleString('fr-FR'),
      },
    ];
  }

  /**
   * Filtre les positions selon les critères donnés
   */
  filterPositions(positions: VehiclePosition[], filters: SupervisionFilters): VehiclePosition[] {
    return positions.filter(position => {
      const statusMatch = filters.status.length === 0 || filters.status.includes(position.status);
      const zoneMatch = filters.zone.length === 0 || filters.zone.includes(position.zone || '');
      const driverMatch = filters.driver.length === 0 || filters.driver.includes(position.driver || '');
      
      return statusMatch && zoneMatch && driverMatch;
    });
  }

  /**
   * Obtient les statistiques de la flotte
   */
  getFleetStats(positions: VehiclePosition[]) {
    const stats = {
      total: positions.length,
      active: positions.filter(p => p.status === 'active').length,
      idle: positions.filter(p => p.status === 'idle').length,
      maintenance: positions.filter(p => p.status === 'maintenance').length,
      averageSpeed: 0,
    };

    const activeVehicles = positions.filter(p => p.status === 'active' && p.speed && p.speed > 0);
    if (activeVehicles.length > 0) {
      stats.averageSpeed = Math.round(
        activeVehicles.reduce((sum, v) => sum + (v.speed || 0), 0) / activeVehicles.length
      );
    }

    return stats;
  }

  /**
   * Nettoie les ressources
   */
  cleanup() {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
  }
}

// Instance singleton
export const supervisionService = new SupervisionService();
export default SupervisionService;
