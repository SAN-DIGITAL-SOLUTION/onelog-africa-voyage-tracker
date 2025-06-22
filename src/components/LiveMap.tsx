// fichier : src/components/LiveMap.tsx
import React, { useRef } from 'react';
import { GoogleMap, Polyline, Marker, useJsApiLoader } from '@react-google-maps/api';
import { useLiveTracking } from '../hooks/useLiveTracking';

const containerStyle = { width: '100%', height: '400px' };
const center = { lat: 0, lng: 0 }; // remplacé dynamiquement

type LiveMapProps = { missionId: string };

export default function LiveMap({ missionId }: LiveMapProps) {
  const points = useLiveTracking(missionId);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || '',  
  });

  if (!isLoaded) return <p>Chargement de la carte…</p>;
  if (!points.length) return <p>En attente de position GPS…</p>;

  const path = points.map(p => ({ lat: p.latitude, lng: p.longitude }));
  const last = path[path.length - 1];

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={last}
      zoom={12}
      onLoad={map => { mapRef.current = map; }}
    >
      <Polyline path={path} options={{ strokeColor: '#007bff', strokeWeight: 4 }} />
      {path.map((pos, i) => (
        <Marker key={i} position={pos} />
      ))}
    </GoogleMap>
  );
}
