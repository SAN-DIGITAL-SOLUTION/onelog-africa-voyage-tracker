import React from 'react';
import { MapPin, AlertCircle } from 'lucide-react';

interface StaticMapProps {
  positions: Array<{
    id: string;
    latitude: number;
    longitude: number;
    vehicule_id: string;
    statut: string;
    mission_id: string;
    timestamp: string;
    vitesse?: number;
  }>;
  loading?: boolean;
}

const StaticMap: React.FC<StaticMapProps> = ({ positions, loading }) => {
  // Générer l'URL de la carte statique avec les marqueurs
  const generateStaticMapUrl = () => {
    if (!positions || positions.length === 0) {
      return 'https://via.placeholder.com/800x600/1e293b/64748b?text=Aucune+position';
    }

    const baseUrl = 'https://static-maps.yandex.ru/v1';
    const apiKey = 'your-yandex-maps-key'; // Remplacer par une clé valide
    
    // Calculer les bounds
    const lats = positions.map(p => p.latitude);
    const lngs = positions.map(p => p.longitude);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    
    // Construire les paramètres de marqueurs
    const markers = positions.map((pos, index) => {
      const color = getStatusColor(pos.statut);
      return `pm2${color}~${pos.longitude},${pos.latitude}`;
    }).join(',');

    return `${baseUrl}?ll=${centerLng},${centerLat}&z=10&size=800,600&l=map&pt=${markers}`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      en_route: 'gn',
      en_attente: 'yl',
      livre: 'bl',
      retour: 'pr'
    };
    return colors[status] || 'gr';
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

  const getStatusClass = (status: string) => {
    const classes = {
      en_route: 'text-green-600',
      en_attente: 'text-amber-600',
      livre: 'text-blue-600',
      retour: 'text-purple-600'
    };
    return classes[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="w-full h-full bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-300 mb-2">Chargement des positions...</p>
          <p className="text-gray-500 text-sm">Vérification de la connexion...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-lg h-full overflow-hidden">
        {/* Header */}
        <div className="bg-gray-700 p-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Vue Carte Statique (Mode Fallback)
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Mode sans WebGL - Les positions sont affichées sous forme de liste
          </p>
        </div>

        <div className="flex h-full">
          {/* Carte statique ou placeholder */}
          <div className="flex-1 p-4">
            <div className="bg-gray-700 rounded-lg h-full flex items-center justify-center">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">Mode Carte Statique</h4>
                <p className="text-gray-400 text-sm mb-4">
                  WebGL non disponible. Les positions sont affichées dans la liste.
                </p>
                <div className="text-xs text-gray-500">
                  <p>Pour la carte interactive :</p>
                  <ul className="text-left mt-2 space-y-1">
                    <li>• Chrome/Firefox/Edge récent</li>
                    <li>• WebGL activé</li>
                    <li>• Drivers graphiques à jour</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des positions */}
          <div className="w-96 bg-gray-800 border-l border-gray-700 overflow-y-auto">
            <div className="p-4 border-b border-gray-700">
              <h4 className="text-white font-semibold">Positions ({positions.length})</h4>
            </div>
            
            <div className="divide-y divide-gray-700">
              {positions.map((position) => (
                <div key={position.id} className="p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium text-sm">{position.vehicule_id}</span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusClass(position.statut)}`}>
                      {getStatusLabel(position.statut)}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    <div>Mission: {position.mission_id}</div>
                    <div>Lat: {position.latitude.toFixed(4)}, Lng: {position.longitude.toFixed(4)}</div>
                    <div>{new Date(position.timestamp).toLocaleString('fr-FR')}</div>
                    {position.vitesse && (
                      <div>Vitesse: {position.vitesse} km/h</div>
                    )}
                  </div>
                </div>
              ))}
              
              {positions.length === 0 && (
                <div className="p-8 text-center">
                  <MapPin className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">Aucune position disponible</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticMap;
