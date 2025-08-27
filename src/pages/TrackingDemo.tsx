import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MapComponent from "../components/MapComponent";
import { useRealtimePositions } from "../hooks/usePositions";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5000,
      refetchInterval: 3000,
    },
  },
});

export default function TrackingDemo() {
  const positions = useRealtimePositions();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(true);

  // Gestion plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Écouter les changements de plein écran
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Filtrer les positions par véhicule
  const filteredPositions = selectedVehicle 
    ? positions?.filter(pos => pos.vehicle_id === selectedVehicle)
    : positions;

  return (
    <QueryClientProvider client={queryClient}>
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${isFullscreen ? 'overflow-hidden' : ''}`}>
        {/* Barre de contrôle supérieure */}
        <div className="bg-white shadow-lg border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                🚚 OneLog Africa - Tracking Temps Réel
              </h1>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>{positions?.length || 0} véhicules actifs</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleFullscreen}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>{isFullscreen ? '⤢' : '⤡'}</span>
                <span>{isFullscreen ? 'Quitter plein écran' : 'Plein écran'}</span>
              </button>
              
              <button
                onClick={() => setShowControls(!showControls)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showControls ? 'Masquer' : 'Afficher'} contrôles
              </button>
            </div>
          </div>
        </div>

        <div className={`${isFullscreen ? 'h-screen' : 'max-w-7xl mx-auto px-4 py-6'} flex flex-col ${isFullscreen ? '' : 'gap-6'}`}>
          {/* Zone principale avec carte et contrôles */}
          <div className={`flex ${isFullscreen ? 'flex-1' : 'flex-col lg:flex-row'} gap-4`}>
            {/* Carte principale avec contrôles intégrés */}
            <div className={`${isFullscreen ? 'flex-1' : 'lg:flex-1'}`}>
              <div className="bg-white rounded-xl shadow-xl overflow-hidden h-full">
                {/* Contrôles de filtre au-dessus de la carte */}
                {showControls && (
                  <div className="bg-gray-50 border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-medium text-gray-700">
                          Filtrer par véhicule:
                        </label>
                        <select
                          value={selectedVehicle || ''}
                          onChange={(e) => setSelectedVehicle(e.target.value || null)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Tous les véhicules</option>
                          {[...new Set(positions?.map(p => p.vehicle_id) || [])].map(vehicle => (
                            <option key={vehicle} value={vehicle}>{vehicle}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>En ligne: {positions?.length || 0}</span>
                        </div>
                        <div className="text-gray-500">
                          Dernière mise à jour: {positions?.[0] ? new Date(positions[0].timestamp).toLocaleTimeString('fr-FR') : 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className={`${isFullscreen ? 'h-[calc(100vh-80px)]' : 'h-[500px] lg:h-[600px]'}`}>
                  <MapComponent className="rounded-xl" />
                </div>
              </div>
            </div>

            {/* Panneau latéral amélioré */}
            {showControls && (
              <div className={`${isFullscreen ? 'w-80' : 'lg:w-80'} flex-shrink-0`}>
                <div className="bg-white rounded-xl shadow-xl p-4 h-full overflow-y-auto">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    📊 Vue d'ensemble
                  </h3>
                  
                  {/* Statistiques rapides */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{positions?.length || 0}</div>
                      <div className="text-xs text-blue-800">Véhicules</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">✓</div>
                      <div className="text-xs text-green-800">En ligne</div>
                    </div>
                  </div>

                  {/* Liste des véhicules */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Véhicules actifs</h4>
                    {filteredPositions && filteredPositions.length > 0 ? (
                      filteredPositions.slice(0, 10).map((pos) => (
                        <div 
                          key={pos.id} 
                          className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedVehicle === pos.vehicle_id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => setSelectedVehicle(
                            selectedVehicle === pos.vehicle_id ? null : pos.vehicle_id
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-sm">{pos.vehicle_id}</span>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500">Actif</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            <div>📍 {pos.latitude.toFixed(4)}, {pos.longitude.toFixed(4)}</div>
                            <div>🕐 {new Date(pos.timestamp).toLocaleTimeString('fr-FR')}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-sm text-gray-500">Aucun véhicule trouvé</p>
                      </div>
                    )}
                  </div>

                  {/* Actions rapides */}
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setSelectedVehicle(null)}
                      className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                    >
                      Afficher tous les véhicules
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barre d'état inférieure */}
          {showControls && !isFullscreen && (
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <span className="text-gray-600">Mode: {isFullscreen ? 'Plein écran' : 'Standard'}</span>
                  <span className="text-gray-600">|</span>
                  <span className="text-gray-600">Mise à jour: Auto</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium">Système actif</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
