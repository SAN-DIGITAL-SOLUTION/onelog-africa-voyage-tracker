import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { useRealtimePositions } from "../hooks/usePositions";
import { MAPBOX_CONFIG, validateMapboxConfig } from "../config/mapbox.config";
import "mapbox-gl/dist/mapbox-gl.css";

// Validation de la configuration
validateMapboxConfig();

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

interface MapComponentProps {
  className?: string;
}

export default function MapComponent({ className }: MapComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Record<string, mapboxgl.Marker>>({});
  const positions = useRealtimePositions();
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    if (!isWebGLSupported()) {
      console.warn('WebGL non supporté, utilisation de la carte statique');
      return;
    }

    try {
      // Initialiser la carte avec configuration Mapbox
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: [MAPBOX_CONFIG.defaultCenter.lng, MAPBOX_CONFIG.defaultCenter.lat], // Abidjan
        zoom: MAPBOX_CONFIG.defaultZoom,
        ...MAPBOX_CONFIG.performanceOptions,
      });

      map.current.on('load', () => {
        setIsMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Erreur Mapbox:', e);
        setIsMapLoaded(false);
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
      console.error('Erreur initialisation carte:', error);
      setIsMapLoaded(false);
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

  if (!isWebGLSupported()) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-semibold mb-2">Carte non disponible</h3>
          <p className="text-gray-600 mb-4">
            WebGL n'est pas supporté ou a échoué. Les positions des véhicules sont disponibles ci-dessous :
          </p>
          <div className="bg-white rounded-lg shadow p-4 max-h-96 overflow-y-auto">
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

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className={`w-full h-full ${className}`} />
      
      {/* Indicateur de connexion */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${
            isMapLoaded ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          <span className="text-sm font-medium">
            {positions?.length || 0} véhicules
          </span>
        </div>
      </div>
      
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
}
