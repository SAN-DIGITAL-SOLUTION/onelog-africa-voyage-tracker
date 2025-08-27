import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { useControlRoom } from '../hooks/useControlRoom';
import { MAPBOX_CONFIG } from '../config/mapbox.config';

interface MapboxClusterProps {
  positions: any[];
  onMarkerClick?: (position: any) => void;
  maxZoom?: number;
  clusterRadius?: number;
}

const MapboxCluster: React.FC<MapboxClusterProps> = ({
  positions,
  onMarkerClick,
  maxZoom = 14,
  clusterRadius = 50
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAPBOX_CONFIG.style,
      center: MAPBOX_CONFIG.defaultCenter,
      zoom: MAPBOX_CONFIG.defaultZoom
    });

    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(new mapboxgl.FullscreenControl());

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded || !positions.length) return;

    const geojsonData = {
      type: 'FeatureCollection' as const,
      features: positions.map(position => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [position.longitude, position.latitude]
        },
        properties: {
          id: position.id,
          vehicule_id: position.vehicule_id,
          mission_id: position.mission_id,
          statut: position.statut,
          vitesse: position.vitesse,
          direction: position.direction,
          timestamp: position.timestamp
        }
      }))
    };

    // Remove existing sources and layers
    if (map.current.getSource('positions')) {
      map.current.removeLayer('clusters');
      map.current.removeLayer('cluster-count');
      map.current.removeLayer('unclustered-point');
      map.current.removeSource('positions');
    }

    // Add new source
    map.current.addSource('positions', {
      type: 'geojson',
      data: geojsonData,
      cluster: true,
      clusterMaxZoom: maxZoom,
      clusterRadius: clusterRadius
    });

    // Add cluster layer
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'positions',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          10,
          '#f1f075',
          30,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          10,
          30,
          30,
          40
        ]
      }
    });

    // Add cluster count layer
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'positions',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });

    // Add individual markers layer
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'positions',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'match',
          ['get', 'statut'],
          'en_route', '#10b981',
          'en_attente', '#f59e0b',
          'livre', '#3b82f6',
          'retour', '#8b5cf6',
          '#6b7280'
        ],
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff'
      }
    });

    // Handle clicks on individual markers
    map.current.on('click', 'unclustered-point', (e) => {
      if (!e.features?.[0]) return;
      
      const coordinates = e.features[0].geometry.coordinates.slice();
      const properties = e.features[0].properties;
      
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(`
          <div class="p-2">
            <h3 class="font-bold text-sm">${properties.vehicule_id}</h3>
            <p class="text-xs text-gray-600">Mission: ${properties.mission_id}</p>
            <p class="text-xs font-medium">Statut: ${properties.statut}</p>
            <p class="text-xs text-gray-500">
              ${new Date(properties.timestamp).toLocaleString('fr-FR')}
            </p>
            ${properties.vitesse > 0 ? `<p class="text-xs">Vitesse: ${properties.vitesse} km/h</p>` : ''}
          </div>
        `)
        .addTo(map.current!);

      if (onMarkerClick) {
        onMarkerClick(properties);
      }
    });

    // Handle clicks on clusters
    map.current.on('click', 'clusters', (e) => {
      if (!e.features?.[0]) return;
      
      const features = map.current!.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      });
      
      const clusterId = features[0].properties.cluster_id;
      
      (map.current!.getSource('positions') as mapboxgl.GeoJSONSource)
        .getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err) return;
          
          map.current!.easeTo({
            center: features[0].geometry.coordinates as [number, number],
            zoom: zoom
          });
        });
    });

    // Change cursor on hover
    map.current.on('mouseenter', 'clusters', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'clusters', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    map.current.on('mouseenter', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'unclustered-point', () => {
      map.current!.getCanvas().style.cursor = '';
    });

    // Fit bounds to show all markers
    if (positions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      positions.forEach(pos => {
        bounds.extend([pos.longitude, pos.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [positions, mapLoaded, maxZoom, clusterRadius, onMarkerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement de la carte...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapboxCluster;
