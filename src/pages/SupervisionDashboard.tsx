import React, { useState, useEffect } from 'react';
import { SupervisionMap } from '../components/supervision/SupervisionMap';
import { useRealtimeMissions } from '../hooks/useRealtimeMissions';
import { useRealtimeVehicles } from '../hooks/useRealtimeVehicles';
import { MissionData, VehiclePosition } from '../services/supervisionService';
import { 
  Filter, 
  Maximize2, 
  Minimize2, 
  RefreshCw, 
  Truck, 
  MapPin, 
  Clock,
  AlertCircle
} from 'lucide-react';

interface FilterState {
  missionStatus: string[];
  vehicleIds: string[];
  priority: string[];
  dateRange: { start: string; end: string } | null;
}

export const SupervisionDashboard: React.FC = () => {
  const { missions, loading: missionsLoading, refetch: refetchMissions } = useRealtimeMissions();
  const { vehicles, loading: vehiclesLoading, refetch: refetchVehicles } = useRealtimeVehicles();
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMission, setSelectedMission] = useState<MissionData | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<VehiclePosition | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    missionStatus: [],
    vehicleIds: [],
    priority: [],
    dateRange: null,
  });

  // Gestion du mode plein écran
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (err) {
        console.error('Erreur lors de l\'activation du plein écran:', err);
      }
    } else {
      try {
        await document.exitFullscreen();
        setIsFullscreen(false);
      } catch (err) {
        console.error('Erreur lors de la sortie du plein écran:', err);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const refreshData = () => {
    refetchMissions();
    refetchVehicles();
  };

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const filteredMissions = missions.filter(mission => {
    if (filters.missionStatus.length > 0 && !filters.missionStatus.includes(mission.status)) {
      return false;
    }
    if (filters.priority.length > 0 && !filters.priority.includes(mission.priority)) {
      return false;
    }
    if (filters.vehicleIds.length > 0 && !filters.vehicleIds.includes(mission.vehicle_id || '')) {
      return false;
    }
    return true;
  });

  const filteredVehicles = vehicles.filter(vehicle => {
    if (filters.vehicleIds.length > 0 && !filters.vehicleIds.includes(vehicle.vehicle_id)) {
      return false;
    }
    return true;
  });

  const stats = {
    totalMissions: missions.length,
    activeMissions: missions.filter(m => m.status === 'in_progress').length,
    pendingMissions: missions.filter(m => m.status === 'pending').length,
    activeVehicles: vehicles.length,
    highPriorityMissions: missions.filter(m => m.priority === 'urgent' || m.priority === 'high').length,
  };

  const FilterPanel = () => (
    <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filtres</h3>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Statut des missions</label>
        <div className="space-y-2">
          {['pending', 'in_progress', 'completed'].map(status => (
            <label key={status} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.missionStatus.includes(status)}
                onChange={(e) => {
                  const newStatus = e.target.checked
                    ? [...filters.missionStatus, status]
                    : filters.missionStatus.filter(s => s !== status);
                  handleFilterChange('missionStatus', newStatus);
                }}
                className="mr-2"
              />
              <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Priorité</label>
        <div className="space-y-2">
          {['low', 'medium', 'high', 'urgent'].map(priority => (
            <label key={priority} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.priority.includes(priority)}
                onChange={(e) => {
                  const newPriority = e.target.checked
                    ? [...filters.priority, priority]
                    : filters.priority.filter(p => p !== priority);
                  handleFilterChange('priority', newPriority);
                }}
                className="mr-2"
              />
              <span className="text-sm capitalize">{priority}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Véhicules</label>
        <select
          multiple
          value={filters.vehicleIds}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            handleFilterChange('vehicleIds', selected);
          }}
          className="w-full border rounded px-2 py-1 text-sm"
          size={4}
        >
          {vehicles.map(vehicle => (
            <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
              {vehicle.vehicle_plate || vehicle.vehicle_id}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={() => setFilters({ missionStatus: [], vehicleIds: [], priority: [], dateRange: null })}
        className="w-full text-sm text-blue-600 hover:text-blue-800"
      >
        Réinitialiser les filtres
      </button>
    </div>
  );

  const MissionCard = ({ mission }: { mission: MissionData }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-sm">{mission.reference}</h4>
          <p className="text-xs text-gray-600">{mission.client_name}</p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          mission.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
          mission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {mission.status}
        </span>
      </div>
      <div className="mt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <MapPin size={12} />
          <span>{mission.start_address} → {mission.end_address}</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Clock size={12} />
          <span>{new Date(mission.estimated_start_time).toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );

  const VehicleCard = ({ vehicle }: { vehicle: VehiclePosition }) => (
    <div className="bg-white p-3 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-sm">{vehicle.vehicle_plate || 'Véhicule'}</h4>
          <p className="text-xs text-gray-600">{vehicle.driver_name || 'Non assigné'}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">{vehicle.speed} km/h</p>
          <p className="text-xs text-gray-500">
            {new Date(vehicle.timestamp).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen bg-gray-50 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Supervision Transporteurs</h1>
            <p className="text-sm text-gray-600">Vue temps réel des missions et véhicules</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Rafraîchir"
            >
              <RefreshCw size={20} />
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title="Filtres"
            >
              <Filter size={20} />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
              title={isFullscreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 py-3">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <Truck className="text-blue-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-gray-600">Missions</p>
                <p className="text-2xl font-bold">{stats.totalMissions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm text-gray-600">Actives</p>
                <p className="text-2xl font-bold">{stats.activeMissions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold">{stats.pendingMissions}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <MapPin className="text-blue-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-gray-600">Véhicules</p>
                <p className="text-2xl font-bold">{stats.activeVehicles}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center">
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <div>
                <p className="text-sm text-gray-600">Urgences</p>
                <p className="text-2xl font-bold">{stats.highPriorityMissions}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 flex-1" style={{ height: isFullscreen ? 'calc(100vh - 200px)' : 'calc(100vh - 250px)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 overflow-y-auto">
            {showFilters && <FilterPanel />}
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3">Missions en cours</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredMissions.map(mission => (
                  <MissionCard key={mission.id} mission={mission} />
                ))}
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold text-lg mb-3">Véhicules actifs</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </div>
          </div>

          {/* Carte */}
          <div className="lg:col-span-3">
            <SupervisionMap
              className="h-full rounded-lg shadow"
              showMissions={true}
              showVehicles={true}
              selectedMissions={selectedMissions}
              selectedVehicles={selectedVehicles}
              onMissionClick={setSelectedMission}
              onVehicleClick={setSelectedVehicle}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
