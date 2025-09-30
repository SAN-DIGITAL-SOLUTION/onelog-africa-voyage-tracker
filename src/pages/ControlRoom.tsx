import React, { useState, useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useControlRoom } from '../hooks/useControlRoom';
import { useAuth } from '../hooks/useAuth';
import { MAPBOX_CONFIG } from '../config/mapbox.config';
import StaticMap from '../components/StaticMap';
import { Play, Pause, Maximize, Minimize, Filter, Truck, Route, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import TVModeToggle from '@/components/dashboard/TVModeToggle';

const ControlRoom: React.FC = () => {
  const { user } = useAuth();
  const {
    positions,
    loading,
    error,
    filters,
    setFilters,
    getVehicules,
    getMissions,
    getStats
  } = useControlRoom();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<Record<string, mapboxgl.Marker>>({});
  const [webGLError, setWebGLError] = useState<string | null>(null);
  const [isWebGLSupported, setIsWebGLSupported] = useState(true);

  // Vérifier la compatibilité WebGL
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      setIsWebGLSupported(false);
      setWebGLError('WebGL non supporté par votre navigateur');
    }
  }, []);

  // Initialiser la carte Mapbox
  useEffect(() => {
    if (!mapContainer.current || !isWebGLSupported) return;

    try {
      mapboxgl.accessToken = MAPBOX_CONFIG.accessToken;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: MAPBOX_CONFIG.style,
        center: MAPBOX_CONFIG.defaultCenter,
        zoom: MAPBOX_CONFIG.defaultZoom,
        failIfMajorPerformanceCaveat: false
      });

      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.addControl(new mapboxgl.FullscreenControl());

      // Gestion des erreurs Mapbox
      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setWebGLError('Erreur lors du chargement de la carte');
      });

      return () => {
        if (map.current) {
          map.current.remove();
          map.current = null;
        }
      };
    } catch (error) {
      console.error('Erreur initialisation Mapbox:', error);
      setWebGLError('Erreur lors de l\'initialisation de la carte');
    }
  }, [isWebGLSupported]);

  // Mettre à jour les marqueurs sur la carte
  useEffect(() => {
    if (!map.current || !positions.length) return;

    // Nettoyer les anciens marqueurs
    Object.values(markers.current).forEach(marker => marker.remove());
    markers.current = {};

    // Ajouter les nouveaux marqueurs
    positions.forEach((position) => {
      const color = getStatusColor(position.statut);
      
      const marker = new mapboxgl.Marker({ color, scale: 1.2 })
        .setLngLat([position.longitude, position.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold text-sm">${position.vehicule_id}</h3>
                <p class="text-xs text-gray-600">Mission: ${position.mission_id}</p>
                <p class="text-xs font-medium ${getStatusClass(position.statut)}">
                  ${getStatusLabel(position.statut)}
                </p>
                <p class="text-xs text-gray-500">
                  ${new Date(position.timestamp).toLocaleString('fr-FR')}
                </p>
                ${position.vitesse > 0 ? `<p class="text-xs">Vitesse: ${position.vitesse} km/h</p>` : ''}
              </div>
            `)
        )
        .addTo(map.current!);

      markers.current[position.id] = marker;
    });

    // Ajuster la vue pour inclure tous les marqueurs
    if (positions.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      positions.forEach(pos => {
        bounds.extend([pos.longitude, pos.latitude]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }
  }, [positions]);

  // Gestion plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
      setShowSidebar(false);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
      setShowSidebar(true);
    }
  };

  // Mode TV (projection)
  const toggleTvMode = () => {
    setShowSidebar(!showSidebar);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      en_route: '#10b981',
      en_attente: '#f59e0b',
      livre: '#3b82f6',
      retour: '#8b5cf6'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusClass = (status: string) => {
    const classes = {
      en_route: 'text-green-600',
      en_attente: 'text-amber-600',
      livre: 'text-blue-600',
      retour: 'text-purple-600'
    };
    return classes[status] || 'text-gray-600';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      en_route: 'En route',
      en_attente: 'En attente',
      livre: 'Livré',
      retour: 'En retour'
    };
    return labels[status] || status;
  };

  const stats = getStats();
  const vehicules = getVehicules();
  const missions = getMissions();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Salle de Contrôle</h2>
          <p className="text-gray-500">Veuillez vous connecter pour accéder au tableau de bord.</p>
        </div>
      </div>
    );
  }

  const handleReload = () => {
    window.location.reload();
  };

  // Mode carte statique en fallback
  if (!isWebGLSupported || webGLError) {
    return (
      <div className="h-screen bg-gray-900 flex">
        <StaticMap positions={positions} loading={loading} />
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex">
      {/* Carte principale */}
      <div className={`flex-1 relative transition-all duration-300 ${showSidebar ? 'mr-80' : ''}`}>
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Contrôles superposés */}
        <div className="absolute top-4 left-4 z-10 flex gap-2">
          <button
            onClick={toggleTvMode}
            className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors"
            title={showSidebar ? "Mode TV" : "Mode Opérateur"}
          >
            {showSidebar ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg hover:bg-white transition-colors"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>
          <TVModeToggle className="bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white" />
        </div>

        {/* Indicateurs de statut */}
        <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Positions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.vehiculesActifs}</div>
              <div className="text-gray-600">Véhicules</div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar (mode opérateur) */}
      {showSidebar && (
        <div className="w-80 bg-white shadow-xl overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Salle de Contrôle</h2>
            <p className="text-sm text-gray-600">Transporteur: {user.email}</p>
          </div>

          {/* Filtres */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4" />
              <h3 className="font-semibold">Filtres</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Véhicule</label>
                <select
                  value={filters.vehicule_id || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, vehicule_id: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Tous les véhicules</option>
                  {vehicules.map(v => (
                    <option key={v.id} value={v.id}>{v.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mission</label>
                <select
                  value={filters.mission_id || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, mission_id: e.target.value || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Toutes les missions</option>
                  {missions.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <div className="space-y-2">
                  {['en_route', 'en_attente', 'livre', 'retour'].map(status => (
                    <label key={status} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!filters.statut || filters.statut.includes(status)}
                        onChange={(e) => {
                          const newStatuts = e.target.checked
                            ? [...(filters.statut || []), status]
                            : (filters.statut || []).filter(s => s !== status);
                          setFilters(prev => ({ ...prev, statut: newStatuts.length > 0 ? newStatuts : undefined }));
                        }}
                        className="mr-2"
                      />
                      <span className={`text-sm ${getStatusClass(status)}`}>
                        {getStatusLabel(status)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="p-4 border-b">
            <h3 className="font-semibold mb-3">Statistiques</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">En route</span>
                <span className="font-medium text-green-600">{stats.enRoute}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En attente</span>
                <span className="font-medium text-amber-600">{stats.enAttente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Livré</span>
                <span className="font-medium text-blue-600">{stats.livre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">En retour</span>
                <span className="font-medium text-purple-600">{stats.retour}</span>
              </div>
            </div>
          </div>

          {/* Liste des positions */}
          <div className="p-4">
            <h3 className="font-semibold mb-3">Positions récentes</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4 text-gray-500">Chargement...</div>
              ) : positions.length === 0 ? (
                <div className="text-center py-4 text-gray-500">Aucune position</div>
              ) : (
                positions.slice(0, 10).map((position) => (
                  <div key={position.id} className="border rounded-lg p-3 text-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{position.vehicule_id}</span>
                      <span className={`px-2 py-1 rounded text-xs ${getStatusClass(position.statut)}`}>
                        {getStatusLabel(position.statut)}
                      </span>
                    </div>
                    <div className="text-gray-600 text-xs">
                      <div>Mission: {position.mission_id}</div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(position.timestamp).toLocaleTimeString('fr-FR')}
                      </div>
                      {position.vitesse > 0 && (
                        <div className="flex items-center gap-1">
                          <Truck className="w-3 h-3" />
                          {position.vitesse} km/h
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ControlRoom;
