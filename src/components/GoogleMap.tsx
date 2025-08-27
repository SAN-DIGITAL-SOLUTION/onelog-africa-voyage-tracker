import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_CONFIG } from '../config/mapbox.config';

interface MapboxMapProps {
  markers: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    icon?: string;
  }>;
  showDirections?: boolean;
  places?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    name: string;
  }>;
}

const MapboxMap: React.FC<MapboxMapProps> = ({
  markers,
  showDirections,
  places,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<Record<string, mapboxgl.Marker>>({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialiser Mapbox
    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.style,
      center: MAPBOX_CONFIG.defaultCenter,
      zoom: MAPBOX_CONFIG.defaultZoom
    });

    // Ajouter les contrôles
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs
  useEffect(() => {
    if (!map.current) return;

    // Nettoyer les anciens marqueurs
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};

    if (markers.length === 0) return;

    // Ajouter les nouveaux marqueurs
    markers.forEach((markerData) => {
      const marker = new mapboxgl.Marker({ color: '#007bff' })
        .setLngLat([markerData.longitude, markerData.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3>${markerData.title || markerData.id}</h3>
                <p>Latitude: ${markerData.latitude}</p>
                <p>Longitude: ${markerData.longitude}</p>
              </div>
            `)
        )
        .addTo(map.current!);

      markerRefs.current[markerData.id] = marker;
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (markers.length > 1) {
      const bounds = new mapboxgl.LngLatBounds();
      markers.forEach(marker => {
        bounds.extend([marker.longitude, marker.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    } else if (markers.length === 1) {
      map.current.setCenter([markers[0].longitude, markers[0].latitude]);
      map.current.setZoom(12);
    }
  }, [markers]);

  // Ajouter les places
  useEffect(() => {
    if (!map.current || !places || places.length === 0) return;

    places.forEach((place) => {
      new mapboxgl.Marker({ color: '#28a745' })
        .setLngLat([place.longitude, place.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div>
                <h3>${place.name}</h3>
                <p>Lieu de livraison</p>
              </div>
            `)
        )
        .addTo(map.current!);
    });
  }, [places]);

  return (
    <div className="relative w-full h-[450px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export default MapboxMap;
