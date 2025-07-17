import { useState, useEffect, useCallback } from 'react';
import { supervisionService, VehiclePosition } from '@/services/SupervisionService';

export interface UseRealtimePositionsReturn {
  positions: VehiclePosition[];
  loading: boolean;
  error: string | null;
  connectionStatus: 'connected' | 'connecting' | 'disconnected';
  refetch: () => Promise<void>;
}

/**
 * Hook pour gérer les positions des véhicules en temps réel
 * Utilise le SupervisionService pour la connexion WebSocket et les données
 */
export const useRealtimePositions = (): UseRealtimePositionsReturn => {
  const [positions, setPositions] = useState<VehiclePosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');

  // Fonction pour récupérer les positions initiales
  const fetchInitialPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // En développement, utiliser les données mock
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      let initialPositions: VehiclePosition[];
      if (isDevelopment) {
        // Simuler un délai réseau
        await new Promise(resolve => setTimeout(resolve, 1000));
        initialPositions = supervisionService.getMockPositions();
      } else {
        initialPositions = await supervisionService.getPositions();
      }
      
      setPositions(initialPositions);
      setConnectionStatus('connected');
    } catch (err) {
      console.error('Erreur lors du chargement des positions:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setConnectionStatus('disconnected');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour les positions
  const handlePositionUpdate = useCallback((newPositions: VehiclePosition[]) => {
    setPositions(newPositions);
    setError(null);
    setConnectionStatus('connected');
  }, []);

  // Fonction pour refetch manuellement
  const refetch = useCallback(async () => {
    await fetchInitialPositions();
  }, [fetchInitialPositions]);

  // Effet pour initialiser et gérer la connexion temps réel
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initializeConnection = async () => {
      // Charger les données initiales
      await fetchInitialPositions();

      // Établir la connexion temps réel
      try {
        cleanup = supervisionService.connectRealtime(handlePositionUpdate);
      } catch (err) {
        console.error('Erreur lors de la connexion temps réel:', err);
        setError('Impossible de se connecter au temps réel');
        setConnectionStatus('disconnected');
      }
    };

    initializeConnection();

    // Nettoyage lors du démontage
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchInitialPositions, handlePositionUpdate]);

  // Simulation de mises à jour en temps réel pour le développement
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && connectionStatus === 'connected') {
      const interval = setInterval(() => {
        setPositions(currentPositions => {
          return currentPositions.map(position => {
            // Simuler des changements aléatoires
            const shouldUpdate = Math.random() < 0.3; // 30% de chance de mise à jour
            
            if (!shouldUpdate) return position;

            // Simuler des changements de position et de statut
            const latChange = (Math.random() - 0.5) * 0.01; // Petit changement de latitude
            const lngChange = (Math.random() - 0.5) * 0.01; // Petit changement de longitude
            const speedChange = position.status === 'active' ? 
              Math.max(0, (position.speed || 0) + (Math.random() - 0.5) * 20) : 0;

            return {
              ...position,
              lat: position.lat + latChange,
              lng: position.lng + lngChange,
              speed: Math.round(speedChange),
              lastUpdate: new Date().toLocaleString('fr-FR'),
            };
          });
        });
      }, 5000); // Mise à jour toutes les 5 secondes

      return () => clearInterval(interval);
    }
  }, [connectionStatus]);

  // Gestion des erreurs de connexion
  useEffect(() => {
    if (error) {
      const retryTimeout = setTimeout(() => {
        console.log('Tentative de reconnexion...');
        setConnectionStatus('connecting');
        fetchInitialPositions();
      }, 10000); // Retry après 10 secondes

      return () => clearTimeout(retryTimeout);
    }
  }, [error, fetchInitialPositions]);

  return {
    positions,
    loading,
    error,
    connectionStatus,
    refetch,
  };
};

export default useRealtimePositions;
