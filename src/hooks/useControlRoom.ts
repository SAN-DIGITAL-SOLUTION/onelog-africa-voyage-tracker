import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useAuth } from './useAuth';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface Position {
  id: string;
  vehicule_id: string;
  mission_id: string;
  transporteur_id: string;
  statut: 'en_route' | 'en_attente' | 'livre' | 'retour';
  latitude: number;
  longitude: number;
  vitesse: number;
  direction: number;
  timestamp: string;
}

export interface ControlRoomFilters {
  vehicule_id?: string;
  mission_id?: string;
  statut?: string[];
  dateDebut?: string;
  dateFin?: string;
}

export const useControlRoom = () => {
  const { user } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ControlRoomFilters>({});

  // Récupérer les positions initiales
  const fetchPositions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('positions')
        .select('*')
        .eq('transporteur_id', user.id)
        .order('timestamp', { ascending: false });

      // Appliquer les filtres
      if (filters.vehicule_id) {
        query = query.eq('vehicule_id', filters.vehicule_id);
      }
      if (filters.mission_id) {
        query = query.eq('mission_id', filters.mission_id);
      }
      if (filters.statut && filters.statut.length > 0) {
        query = query.in('statut', filters.statut);
      }
      if (filters.dateDebut) {
        query = query.gte('timestamp', filters.dateDebut);
      }
      if (filters.dateFin) {
        query = query.lte('timestamp', filters.dateFin);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPositions(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, filters]);

  // Récupérer les dernières positions par véhicule
  const fetchLatestPositions = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      
      // Ajouter un timeout de 10 secondes
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de connexion')), 10000)
      );

      let data = null;
      let error = null;

      try {
        // Essayer d'abord la fonction RPC
        const fetchPromise = supabase
          .rpc('get_latest_positions', { transporteur_uuid: user.id });

        const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
        data = result.data;
        error = result.error;
      } catch (err) {
        error = err;
      }

      // Fallback sur la table tracking_points si la fonction échoue
      if (error) {
        console.warn('Fonction get_latest_positions échouée, fallback sur tracking_points:', error);
        try {
          const fallbackPromise = supabase
            .from('tracking_points')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

          const result = await Promise.race([fallbackPromise, timeoutPromise]) as any;
          data = result.data;
          error = result.error;
        } catch (err) {
          error = err;
        }
      }

      if (error) {
        console.error('Erreur finale:', error);
        setError(`Erreur de connexion: ${error.message}`);
        setPositions([]);
      } else {
        setPositions(data || []);
      }
    } catch (err) {
      console.error('Erreur fetch:', err);
      setError(err.message || 'Erreur de connexion au serveur');
      setPositions([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user) return;

    // Charger les données initiales
    fetchLatestPositions();

    // Écouter les changements en temps réel
    const channel = supabase
      .channel('positions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'positions',
          filter: `transporteur_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPositions(prev => [payload.new as Position, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setPositions(prev => 
              prev.map(pos => 
                pos.id === payload.new.id ? payload.new as Position : pos
              )
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Obtenir les véhicules uniques
  const getVehicules = () => {
    const vehicules = positions.map(pos => ({
      id: pos.vehicule_id,
      label: `Véhicule ${pos.vehicule_id}`
    }));
    return [...new Map(vehicules.map(v => [v.id, v])).values()];
  };

  // Obtenir les missions uniques
  const getMissions = () => {
    const missions = positions.map(pos => ({
      id: pos.mission_id,
      label: `Mission ${pos.mission_id}`
    }));
    return [...new Map(missions.map(m => [m.id, m])).values()];
  };

  // Filtrer les positions selon les filtres actifs
  const getFilteredPositions = () => {
    return positions.filter(pos => {
      if (filters.vehicule_id && pos.vehicule_id !== filters.vehicule_id) return false;
      if (filters.mission_id && pos.mission_id !== filters.mission_id) return false;
      if (filters.statut && filters.statut.length > 0 && !filters.statut.includes(pos.statut)) return false;
      return true;
    });
  };

  // Obtenir les statistiques
  const getStats = () => {
    const filtered = getFilteredPositions();
    return {
      total: filtered.length,
      enRoute: filtered.filter(p => p.statut === 'en_route').length,
      enAttente: filtered.filter(p => p.statut === 'en_attente').length,
      livre: filtered.filter(p => p.statut === 'livre').length,
      retour: filtered.filter(p => p.statut === 'retour').length,
      vehiculesActifs: new Set(filtered.map(p => p.vehicule_id)).size,
      missionsActives: new Set(filtered.map(p => p.mission_id)).size
    };
  };

  return {
    positions: getFilteredPositions(),
    loading,
    error,
    filters,
    setFilters,
    fetchPositions,
    fetchLatestPositions,
    getVehicules,
    getMissions,
    getStats
  };
};
