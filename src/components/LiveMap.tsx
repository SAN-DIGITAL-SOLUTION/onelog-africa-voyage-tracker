// fichier : src/components/LiveMap.tsx
import mapboxgl from 'mapbox-gl';
import { useEffect, useRef } from 'react';
import { useLiveTracking } from '../hooks/useLiveTracking';
import { MAPBOX_CONFIG } from '../config/mapbox.config';

interface LiveMapProps {
  missionId: string;
}

export default function LiveMap({ missionId }: LiveMapProps) {
  const points = useLiveTracking(missionId);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !points.length) return;

    // Initialiser Mapbox
    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: [points[0].longitude, points[0].latitude],
        zoom: 12
      });
    }

    // Nettoyer la carte
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [points]);

  useEffect(() => {
    if (!map.current || !points.length) return;

    // Créer la ligne de parcours
    const path = points.map(p => [p.longitude, p.latitude]);
    
    // Centrer sur la dernière position
    const lastPoint = points[points.length - 1];
    map.current.setCenter([lastPoint.longitude, lastPoint.latitude]);

    // Ajouter la source et la couche si elles n'existent pas
    if (!map.current.getSource('mission-path')) {
      map.current.addSource('mission-path', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: path
          },
          properties: {}
        }
      });

      map.current.addLayer({
        id: 'mission-path',
        type: 'line',
        source: 'mission-path',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#007bff',
          'line-width': 4
        }
      });
    } else {
      // Mettre à jour les données
      const source = map.current.getSource('mission-path') as mapboxgl.GeoJSONSource;
      source.setData({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: path
        },
        properties: {}
      });
    }

    // Ajouter les marqueurs
    points.forEach((point, index) => {
      const markerId = `marker-${index}`;
      const existingMarker = document.getElementById(markerId);
      
      if (!existingMarker) {
        new mapboxgl.Marker({ color: '#007bff' })
          .setLngLat([point.longitude, point.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div>
                  <h3>Position ${index + 1}</h3>
                  <p>${new Date(point.timestamp).toLocaleString()}</p>
                </div>
              `)
          )
          .addTo(map.current!);
      }
    });
  }, [points]);

  if (!points.length) return <p>En attente de position GPS…</p>;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border">
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}
