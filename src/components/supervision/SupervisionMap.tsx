import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useRealtimeMissions } from '../../hooks/useRealtimeMissions';
import { useRealtimeVehicles } from '../../hooks/useRealtimeVehicles';
import { MissionData, VehiclePosition } from '../../services/supervisionService';
import 'leaflet/dist/leaflet.css';

// Configuration des icônes personnalisées
const vehicleIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTkgOUgyMFYyMEg0VjlINUMxMiA5IDEyIDIgMTIgMloiIGZpbGw9IiMzQjgyRjYiLz4KPC9zdmc+',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

const missionStartIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iIzEwQjk4NCIvPgo8L3N2Zz4=',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const missionEndIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTIiIGN5PSIxMiIgcj0iOCIgZmlsbD0iI0VGNDQ0NCIvPgo8L3N2Zz4=',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

interface SupervisionMapProps {
  className?: string;
  center?: [number, number];
  zoom?: number;
  showMissions?: boolean;
  showVehicles?: boolean;
  selectedMissions?: string[];
  selectedVehicles?: string[];
  onMissionClick?: (mission: MissionData) => void;
  onVehicleClick?: (vehicle: VehiclePosition) => void;
}

// Composant pour recentrer la carte automatiquement
function MapUpdater({ center, bounds }: { center?: [number, number]; bounds?: L.LatLngBounds }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
    }
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [map, center, bounds]);

  return null;
}

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || 'your_mapbox_token';
const MAPBOX_STYLE = import.meta.env.VITE_MAPBOX_STYLE || 'mapbox/streets-v11';

const MAPBOX_URL = `https://api.mapbox.com/styles/v1/${MAPBOX_STYLE}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;

export const SupervisionMap: React.FC<SupervisionMapProps> = ({
  className,
  center = [6.3703, 2.3912], // Cotonou, Bénin
  zoom = 10,
  showMissions = true,
  showVehicles = true,
  selectedMissions = [],
  selectedVehicles = [],
  onMissionClick,
  onVehicleClick,
}) => {
  const { missions, loading: missionsLoading } = useRealtimeMissions();
  const { vehicles, loading: vehiclesLoading } = useRealtimeVehicles();
  const [mapBounds, setMapBounds] = useState<L.LatLngBounds | undefined>();

  // Calculer les bounds pour inclure tous les marqueurs
  useEffect(() => {
    const allPositions: L.LatLngExpression[] = [];

    if (showMissions) {
      missions.forEach(mission => {
        allPositions.push([mission.start_lat, mission.start_lng]);
        allPositions.push([mission.end_lat, mission.end_lng]);
      });
    }

    if (showVehicles) {
      vehicles.forEach(vehicle => {
        allPositions.push([vehicle.latitude, vehicle.longitude]);
      });
    }

    if (allPositions.length > 0) {
      const bounds = L.latLngBounds(allPositions);
      setMapBounds(bounds);
    }
  }, [missions, vehicles, showMissions, showVehicles]);

  if (missionsLoading || vehiclesLoading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const filteredMissions = selectedMissions.length > 0 
    ? missions.filter(m => selectedMissions.includes(m.id))
    : missions;

  const filteredVehicles = selectedVehicles.length > 0
    ? vehicles.filter(v => selectedVehicles.includes(v.vehicle_id))
    : vehicles;

  return (
    <div className={`relative h-full w-full ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url={MAPBOX_URL}
          attribution='&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        
        <MapUpdater bounds={mapBounds} />

        {/* Affichage des missions */}
        {showMissions && filteredMissions.map(mission => (
          <React.Fragment key={mission.id}>
            {/* Point de départ */}
            <Marker
              position={[mission.start_lat, mission.start_lng]}
              icon={missionStartIcon}
              eventHandlers={{
                click: () => onMissionClick?.(mission),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm">Départ: {mission.reference}</h3>
                  <p className="text-xs text-gray-600">{mission.start_address}</p>
                  <p className="text-xs">Client: {mission.client_name}</p>
                  <p className="text-xs">Statut: {mission.status}</p>
                </div>
              </Popup>
            </Marker>

            {/* Point d'arrivée */}
            <Marker
              position={[mission.end_lat, mission.end_lng]}
              icon={missionEndIcon}
              eventHandlers={{
                click: () => onMissionClick?.(mission),
              }}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-sm">Arrivée: {mission.reference}</h3>
                  <p className="text-xs text-gray-600">{mission.end_address}</p>
                  <p className="text-xs">Client: {mission.client_name}</p>
                  <p className="text-xs">Statut: {mission.status}</p>
                </div>
              </Popup>
            </Marker>

            {/* Ligne de trajet */}
            <Polyline
              positions={[
                [mission.start_lat, mission.start_lng],
                [mission.end_lat, mission.end_lng],
              ]}
              color={mission.status === 'in_progress' ? '#3B82F6' : '#6B7280'}
              weight={3}
              opacity={0.7}
              dashArray={mission.status === 'pending' ? '5, 10' : undefined}
            />
          </React.Fragment>
        ))}

        {/* Affichage des véhicules */}
        {showVehicles && filteredVehicles.map(vehicle => (
          <Marker
            key={vehicle.id}
            position={[vehicle.latitude, vehicle.longitude]}
            icon={vehicleIcon}
            eventHandlers={{
              click: () => onVehicleClick?.(vehicle),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-sm">
                  {vehicle.vehicle_plate || 'Véhicule inconnu'}
                </h3>
                <p className="text-xs">{vehicle.driver_name || 'Chauffeur non assigné'}</p>
                <p className="text-xs">Vitesse: {vehicle.speed} km/h</p>
                <p className="text-xs">
                  Dernière mise à jour: {new Date(vehicle.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Légende */}
      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-lg z-[1000]">
        <h4 className="font-bold text-sm mb-2">Légende</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Départ mission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Arrivée mission</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-sm"></div>
            <span>Véhicule</span>
          </div>
        </div>
      </div>
    </div>
  );
};
