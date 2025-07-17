import React, { useEffect, useRef, useState } from 'react';
import { useRealtimePositions } from '@/hooks/useRealtimePositions';
import { ButtonVariants } from '@/components/ui-system';
import { MapIcon, ExpandIcon, FilterIcon } from 'lucide-react';

interface VehiclePosition {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: 'active' | 'idle' | 'maintenance';
  mission?: string;
  driver?: string;
  lastUpdate: string;
}

interface MapViewProps {
  filters: {
    status: string[];
    zone: string[];
    driver: string[];
  };
  onMarkerClick?: (vehicle: VehiclePosition) => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  filters, 
  onMarkerClick, 
  fullscreen = false, 
  onToggleFullscreen 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePosition | null>(null);
  const { positions, loading, error, connectionStatus } = useRealtimePositions();

  // Filtrer les positions selon les filtres actifs
  const filteredPositions = positions.filter(position => {
    const statusMatch = filters.status.length === 0 || filters.status.includes(position.status);
    const driverMatch = filters.driver.length === 0 || filters.driver.includes(position.driver || '');
    return statusMatch && driverMatch;
  });

  // Simuler une carte interactive (en attendant l'intégration Google Maps/Leaflet)
  const handleMarkerClick = (vehicle: VehiclePosition) => {
    setSelectedVehicle(vehicle);
    onMarkerClick?.(vehicle);
  };

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'active': return '#009688'; // Success green
      case 'idle': return '#F9A825';   // Accent yellow
      case 'maintenance': return '#E65100'; // Secondary orange
      default: return '#263238';       // Dark gray
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active': return 'Actif';
      case 'idle': return 'Inactif';
      case 'maintenance': return 'Maintenance';
      default: return 'Inconnu';
    }
  };

  return (
    <div 
      className={`relative ${fullscreen ? 'fixed inset-0 z-50' : 'h-96'} bg-gray-200 rounded-lg overflow-hidden border-2 border-[#1A3C40]/20`}
      data-testid="map-container"
    >
      {/* Header de la carte */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              connectionStatus === 'connected' ? 'bg-[#009688]' : 
              connectionStatus === 'connecting' ? 'bg-[#F9A825]' : 'bg-[#E65100]'
            } animate-pulse`}></div>
            <span 
              className="text-sm font-medium text-[#263238]"
              data-testid="connection-status"
              aria-live="polite"
            >
              {connectionStatus === 'connected' ? 'Temps réel' : 
               connectionStatus === 'connecting' ? 'Connexion...' : 'Déconnecté'}
            </span>
            <span 
              className="text-xs text-[#263238]/70"
              data-testid="vehicle-count"
              aria-live="polite"
            >
              {filteredPositions.length} véhicule{filteredPositions.length > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex space-x-2">
          <ButtonVariants
            variant="ghost"
            size="sm"
            onClick={onToggleFullscreen}
            className="bg-white/90 backdrop-blur-sm"
            data-testid="fullscreen-toggle"
          >
            <ExpandIcon className="w-4 h-4" />
            {fullscreen ? 'Quitter' : 'Plein écran'}
          </ButtonVariants>
        </div>
      </div>

      {/* Zone de la carte */}
      <div ref={mapRef} className="w-full h-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1A3C40] mx-auto mb-4"></div>
              <p className="text-[#263238]">Chargement de la carte...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center">
              <MapIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <p className="text-red-600">Erreur de connexion</p>
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Fond de carte simulé */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-green-100">
              <div className="absolute inset-0 opacity-20">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <defs>
                    <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                      <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#1A3C40" strokeWidth="0.5"/>
                    </pattern>
                  </defs>
                  <rect width="100" height="100" fill="url(#grid)" />
                </svg>
              </div>
            </div>

            {/* Marqueurs des véhicules */}
            {filteredPositions.map((vehicle, index) => (
              <div
                key={vehicle.id}
                className="absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 hover:scale-110"
                style={{
                  left: `${20 + (index * 15) % 60}%`,
                  top: `${30 + (index * 20) % 40}%`,
                }}
                onClick={() => handleMarkerClick(vehicle)}
                data-testid={`vehicle-marker-${vehicle.id}`}
              >
                <div 
                  className="w-4 h-4 rounded-full border-2 border-white shadow-lg"
                  style={{ backgroundColor: getMarkerColor(vehicle.status) }}
                >
                  {vehicle.status === 'active' && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-current opacity-75"></div>
                  )}
                </div>
                <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs whitespace-nowrap shadow-md">
                  {vehicle.name}
                </div>
              </div>
            ))}

            {/* Légende */}
            <div 
              className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md"
              data-testid="map-legend"
            >
              <h4 className="text-sm font-semibold text-[#263238] mb-2">Légende</h4>
              <div className="space-y-1">
                {['active', 'idle', 'maintenance'].map(status => (
                  <div key={status} className="flex items-center space-x-2">
                    <div 
                      className="w-3 h-3 rounded-full border border-white"
                      style={{ backgroundColor: getMarkerColor(status) }}
                    ></div>
                    <span className="text-xs text-[#263238]">{getStatusLabel(status)}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Popup d'information véhicule */}
      {selectedVehicle && (
        <div 
          className="absolute top-20 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs z-20 border border-[#1A3C40]/20"
          data-testid="vehicle-popup"
        >
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-[#1A3C40]">{selectedVehicle.name}</h3>
            <button 
              onClick={() => setSelectedVehicle(null)}
              className="text-[#263238]/50 hover:text-[#263238] transition-colors"
              data-testid="close-popup"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#263238]/70">Statut:</span>
              <span className={`font-medium ${
                selectedVehicle.status === 'active' ? 'text-[#009688]' :
                selectedVehicle.status === 'idle' ? 'text-[#F9A825]' : 'text-[#E65100]'
              }`}>
                {getStatusLabel(selectedVehicle.status)}
              </span>
            </div>
            {selectedVehicle.mission && (
              <div className="flex justify-between">
                <span className="text-[#263238]/70">Mission:</span>
                <span className="font-medium text-[#263238]">{selectedVehicle.mission}</span>
              </div>
            )}
            {selectedVehicle.driver && (
              <div className="flex justify-between">
                <span className="text-[#263238]/70">Chauffeur:</span>
                <span className="font-medium text-[#263238]">{selectedVehicle.driver}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#263238]/70">Dernière MAJ:</span>
              <span className="text-xs text-[#263238]/50">{selectedVehicle.lastUpdate}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
