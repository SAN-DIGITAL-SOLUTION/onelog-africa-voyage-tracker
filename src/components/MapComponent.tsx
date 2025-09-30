import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AlertTriangle, RefreshCw, Wifi, WifiOff, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRealtimePositions } from '@/hooks/usePositions';
import { MAPBOX_CONFIG, validateMapboxConfig } from "../config/mapbox.config";

// Types d'erreurs
enum MapErrorType {
  WEBGL_NOT_SUPPORTED = 'WEBGL_NOT_SUPPORTED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  CONFIG_ERROR = 'CONFIG_ERROR',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',
  DATA_ERROR = 'DATA_ERROR'
}

interface MapError {
  type: MapErrorType;
  message: string;
  recoverable: boolean;
}

// Validation de la configuration
try {
  validateMapboxConfig();
} catch (error) {
  console.error('Configuration Mapbox invalide:', error);
}

// Configuration Mapbox
mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

// Vérification de compatibilité WebGL
const isWebGLSupported = () => {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && 
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
};

// Vérification de la connectivité réseau
const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch('https://api.mapbox.com/v1/ping', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
};

interface MapComponentProps {
  className?: string;
  height?: string;
  positions?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    vehicleId?: string;
    timestamp?: string;
    speed?: number;
    mission_id?: string;
  }>;
  onPositionClick?: (position: any) => void;
  showRealTimeTracking?: boolean;
  enableGeofencing?: boolean;
  optimizeForTransporters?: boolean;
  onError?: (error: MapError) => void;
}

export default function MapComponent({ className, height, positions, onPositionClick, showRealTimeTracking, enableGeofencing, optimizeForTransporters, onError }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Record<string, mapboxgl.Marker>>({});
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { data: positionsData, isLoading, error: positionsError } = useRealtimePositions();
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<MapError | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<boolean>(true);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRY_ATTEMPTS = 3;
  const RETRY_DELAY = 2000;

  // Fonction pour gérer les erreurs
  const handleError = useCallback((error: MapError) => {
    setMapError(error);
    onError?.(error);
    console.error(`Erreur carte [${error.type}]:`, error.message);
  }, [onError]);

  // Fonction de retry avec backoff exponentiel
  const retryInitialization = useCallback(async () => {
    if (retryCount >= MAX_RETRY_ATTEMPTS) {
      handleError({
        type: MapErrorType.INITIALIZATION_ERROR,
        message: `Impossible d'initialiser la carte après ${MAX_RETRY_ATTEMPTS} tentatives`,
        recoverable: false
      });
      return;
    }

    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    // Vérifier la connectivité réseau
    const isConnected = await checkNetworkConnectivity();
    setNetworkStatus(isConnected);

    if (!isConnected) {
      handleError({
        type: MapErrorType.NETWORK_ERROR,
        message: 'Pas de connexion internet. Vérifiez votre connexion réseau.',
        recoverable: true
      });
      
      // Retry après délai
      retryTimeoutRef.current = setTimeout(() => {
        retryInitialization();
      }, RETRY_DELAY * Math.pow(2, retryCount));
      return;
    }

    // Retry l'initialisation
    setTimeout(() => {
      setIsRetrying(false);
      initializeMap();
    }, RETRY_DELAY);
  }, [retryCount, handleError]);

  // Fonction d'initialisation de la carte
  const initializeMap = useCallback(() => {
    if (map.current || !mapContainer.current) return;

    if (!isWebGLSupported()) {
      handleError({
        type: MapErrorType.WEBGL_NOT_SUPPORTED,
        message: 'WebGL n\'est pas supporté par votre navigateur. Veuillez utiliser un navigateur plus récent.',
        recoverable: false
      });
      return;
    }

    try {
      // Réinitialiser les erreurs
      setMapError(null);
      setRetryCount(0);

      // Initialiser la carte avec configuration Mapbox
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: [MAPBOX_CONFIG.defaultCenter.lng, MAPBOX_CONFIG.defaultCenter.lat],
        zoom: MAPBOX_CONFIG.defaultZoom,
        ...MAPBOX_CONFIG.performanceOptions,
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Erreur Mapbox:', e);
        setIsMapLoaded(false);
        setMapError('Carte indisponible : erreur de chargement de la carte');
      });

      // Ajouter contrôles
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de la carte:', error);
      setMapError({
        type: MapErrorType.INITIALIZATION_ERROR,
        message: 'Erreur lors de l\'initialisation de la carte',
        recoverable: true
      });
      return;
    }
  }, []);

  useEffect(() => {
    if (!map.current || !isMapLoaded || !positions) return;

    // Mettre à jour les marqueurs
    positions.forEach(pos => {
      if (markers.current[pos.vehicle_id]) {
        // Animer le déplacement du marqueur
        const marker = markers.current[pos.vehicle_id];
        marker.setLngLat([pos.longitude, pos.latitude]);
        
        // Mettre à jour le popup
        marker.setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(`
            <div class="p-3">
              <h3 class="font-bold text-lg mb-1">${pos.vehicle_id}</h3>
              <p class="text-sm text-gray-600 mb-1">
                📍 ${pos.latitude.toFixed(6)}, ${pos.longitude.toFixed(6)}
              </p>
              <p class="text-xs text-gray-500">
                ${new Date(pos.timestamp).toLocaleString('fr-FR')}
              </p>
            </div>
          `)
        );
      } else {
        // Créer nouveau marqueur
        const el = document.createElement("div");
        el.className = "vehicle-marker";
        el.style.width = "24px";
        el.style.height = "24px";
        el.style.backgroundColor = "#ef4444";
        el.style.borderRadius = "50%";
        el.style.border = "3px solid white";
        el.style.boxShadow = "0 2px 6px rgba(0,0,0,0.3)";
        el.style.cursor = "pointer";

        const marker = new mapboxgl.Marker(el)
          .setLngLat([pos.longitude, pos.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <div class="p-3">
                <h3 class="font-bold text-lg mb-1">${pos.vehicle_id}</h3>
                <p class="text-sm text-gray-600 mb-1">
                  📍 ${pos.latitude.toFixed(6)}, ${pos.longitude.toFixed(6)}
                </p>
                <p class="text-xs text-gray-500">
                  ${new Date(pos.timestamp).toLocaleString('fr-FR')}
                </p>
              </div>
            `)
          )
          .addTo(map.current!);

        markers.current[pos.vehicle_id] = marker;
      }
    });

    // Nettoyer les marqueurs de véhicules qui n'existent plus
    Object.keys(markers.current).forEach(vehicleId => {
      if (!positions.find(p => p.vehicle_id === vehicleId)) {
        markers.current[vehicleId].remove();
        delete markers.current[vehicleId];
      }
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (positions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      positions.forEach(pos => {
        bounds.extend([pos.longitude, pos.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [positions, isMapLoaded]);

  // Nettoyage des timeouts
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Initialisation de la carte
  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  // Interface d'erreur WebGL
  if (!isWebGLSupported()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Carte non disponible</h3>
          <p className="text-gray-600 mb-4">
            WebGL n'est pas supporté par votre navigateur. Veuillez utiliser un navigateur plus récent.
          </p>
          <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
            <h4 className="font-medium mb-2">Positions des véhicules :</h4>
            {positions?.map((pos) => (
              <div key={pos.id} className="border-b last:border-b-0 py-2">
                <div className="font-medium">{pos.vehicle_id}</div>
                <div className="text-sm text-gray-600">
                  📍 {pos.latitude.toFixed(6)}, {pos.longitude.toFixed(6)}
                </div>
                <div className="text-xs text-gray-500">
                  🕐 {new Date(pos.timestamp).toLocaleString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Interface d'erreur générale
  if (mapError) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Erreur de carte</h3>
          <p className="text-red-600 mb-4">{mapError.message}</p>
          
          {mapError.recoverable && (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setMapError(null);
                  setRetryCount(0);
                  retryInitialization();
                }}
                disabled={isRetrying}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
              >
                {isRetrying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tentative {retryCount}/{MAX_RETRY_ATTEMPTS}...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Réessayer
                  </>
                )}
              </button>
              
              {!networkStatus && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <WifiOff className="w-4 h-4" />
                  Connexion internet requise
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className={`w-full h-full ${className}`} />
      
      {/* Indicateurs de statut */}
      <div className="absolute top-4 left-4 space-y-2 z-10">
        {/* Statut de connexion */}
        <div className="bg-white rounded-lg shadow-lg p-3">
          <div className="flex items-center space-x-2">
            {networkStatus ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <div className={`w-2 h-2 rounded-full ${
              isMapLoaded ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="text-sm font-medium">
              {positions?.length || 0} véhicules
            </span>
          </div>
        </div>

        {/* Indicateur de chargement des données */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
              <span className="text-sm">Actualisation...</span>
            </div>
          </div>
        )}

        {/* Erreur de données */}
        {positionsError && (
          <div className="bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm text-red-600">Erreur données</span>
            </div>
          </div>
        )}
      </div>

      {/* Overlay de chargement initial */}
      {!isMapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Chargement de la carte...</p>
            {isRetrying && (
              <p className="text-sm text-gray-500 mt-2">
                Tentative {retryCount}/{MAX_RETRY_ATTEMPTS}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
