import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapIcon, ViewColumnsIcon, ClockIcon, TruckIcon, BellIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

type ViewType = 'map' | 'cards' | 'timeline';

interface VehicleData {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'maintenance';
  location: string;
  mission: string;
}

interface MissionCard {
  id: string;
  title: string;
  status: 'en_cours' | 'termine' | 'en_attente';
  progress: number;
  client: string;
  chauffeur: string;
}

const UXPrototype: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('map');

  // Données de démonstration
  const vehicles: VehicleData[] = [
    { id: '1', name: 'Camion A-001', status: 'active', location: 'Dakar Centre', mission: 'Livraison Port-Pikine' },
    { id: '2', name: 'Camion B-002', status: 'idle', location: 'Rufisque', mission: 'En attente' },
    { id: '3', name: 'Camion C-003', status: 'active', location: 'Thiès', mission: 'Transport Kaolack' },
  ];

  const missions: MissionCard[] = [
    { id: '1', title: 'Transport Dakar-Thiès', status: 'en_cours', progress: 65, client: 'SONATEL', chauffeur: 'Amadou Ba' },
    { id: '2', title: 'Livraison Port-Pikine', status: 'en_cours', progress: 30, client: 'SUNEOR', chauffeur: 'Moussa Diop' },
    { id: '3', title: 'Collecte Kaolack', status: 'termine', progress: 100, client: 'CSS', chauffeur: 'Ibrahima Fall' },
  ];

  const ViewSwitcher = () => (
    <div className="flex space-x-2 mb-6 bg-gray-100 p-1 rounded-lg">
      {[
        { key: 'map', icon: MapIcon, label: 'Map-First' },
        { key: 'cards', icon: ViewColumnsIcon, label: 'Card-First' },
        { key: 'timeline', icon: ClockIcon, label: 'Timeline-First' }
      ].map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          onClick={() => setCurrentView(key as ViewType)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
            currentView === key 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Icon className="w-5 h-5" />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </div>
  );

  const MapFirstView = () => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full"
    >
      {/* Sidebar compacte */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Filtres</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" defaultChecked />
              <span className="text-sm">Véhicules actifs</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm">En maintenance</span>
            </label>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h3 className="font-semibold text-gray-800 mb-3">KPI</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Actifs</span>
              <span className="font-medium text-green-600">2</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Inactifs</span>
              <span className="font-medium text-gray-500">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Carte principale */}
      <div className="lg:col-span-3">
        <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center relative">
          <div className="text-center">
            <MapIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Carte Interactive Temps Réel</p>
            <p className="text-sm text-gray-500 mt-2">WebSocket + Supabase Realtime</p>
          </div>
          
          {/* Marqueurs simulés */}
          <div className="absolute top-4 left-4 bg-green-500 w-3 h-3 rounded-full animate-pulse"></div>
          <div className="absolute bottom-8 right-8 bg-blue-500 w-3 h-3 rounded-full animate-pulse"></div>
          <div className="absolute top-1/2 left-1/3 bg-red-500 w-3 h-3 rounded-full"></div>
        </div>
      </div>
    </motion.div>
  );

  const CardFirstView = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {/* Card Missions */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Missions</h3>
          <TruckIcon className="w-6 h-6 text-blue-600" />
        </div>
        <div className="space-y-3">
          {missions.slice(0, 2).map((mission) => (
            <div key={mission.id} className="border-l-4 border-blue-500 pl-3">
              <p className="font-medium text-sm">{mission.title}</p>
              <p className="text-xs text-gray-600">{mission.client}</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${mission.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Card Notifications */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Notifications</h3>
          <BellIcon className="w-6 h-6 text-yellow-600" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="text-sm">5 non lues</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm">12 envoyées</span>
          </div>
        </div>
      </div>

      {/* Card Facturation */}
      <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">Facturation</h3>
          <DocumentTextIcon className="w-6 h-6 text-green-600" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Ce mois</span>
            <span className="font-medium">2.5M FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">En attente</span>
            <span className="font-medium text-orange-600">850K FCFA</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const TimelineFirstView = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-6"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-800 mb-4">Timeline des Événements</h3>
        <div className="space-y-4">
          {[
            { time: '14:30', event: 'Départ Camion A-001', status: 'success' },
            { time: '13:45', event: 'Livraison terminée - Thiès', status: 'success' },
            { time: '12:20', event: 'Notification envoyée au client', status: 'info' },
            { time: '11:15', event: 'Maintenance programmée B-002', status: 'warning' },
          ].map((item, index) => (
            <div key={index} className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'success' ? 'bg-green-500' :
                  item.status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">{item.event}</span>
                  <span className="text-xs text-gray-500">{item.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">OneLog Africa - Prototype UX</h1>
          <p className="text-gray-600">Phase 0 - Revue des interfaces Map-First, Card-First, Timeline-First</p>
        </div>

        <ViewSwitcher />

        <AnimatePresence mode="wait">
          {currentView === 'map' && <MapFirstView key="map" />}
          {currentView === 'cards' && <CardFirstView key="cards" />}
          {currentView === 'timeline' && <TimelineFirstView key="timeline" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UXPrototype;
