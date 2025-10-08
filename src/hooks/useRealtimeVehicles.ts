import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import { VehiclePosition } from '../services/supervisionService';

export function useRealtimeVehicles() {
  const [vehicles, setVehicles] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVehicles();

    // S'abonner aux changements en temps réel
    const subscription = supabase
      .channel('vehicles-realtime')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'vehicle_positions' },
        (payload) => {
          handleRealtimeChange(payload);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
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

      if (error) throw error;

      // Ne garder que la position la plus récente par véhicule
      const latestPositions = new Map<string, VehiclePosition>();
      data?.forEach(pos => {
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

      setVehicles(Array.from(latestPositions.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const handleRealtimeChange = (payload: any) => {
    const newPosition = payload.new;
    
    setVehicles(prev => {
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const updatedPosition: VehiclePosition = {
          id: newPosition.id,
          vehicle_id: newPosition.vehicle_id,
          latitude: newPosition.latitude,
          longitude: newPosition.longitude,
          speed: newPosition.speed || 0,
          heading: newPosition.heading || 0,
          timestamp: newPosition.timestamp,
          driver_name: newPosition.vehicle?.driver?.name,
          vehicle_plate: newPosition.vehicle?.plate_number,
        };

        // Remplacer l'ancienne position par la nouvelle
        const filtered = prev.filter(v => v.vehicle_id !== newPosition.vehicle_id);
        return [updatedPosition, ...filtered];
      } else if (payload.eventType === 'DELETE') {
        return prev.filter(v => v.id !== payload.old.id);
      }
      
      return prev;
    });
  };

  return { vehicles, loading, error, refetch: fetchVehicles };
}
