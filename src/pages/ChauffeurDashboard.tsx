import { useEffect, useState } from 'react';
import { Truck, MapPin, Clock, Navigation, CheckCircle, AlertTriangle, Phone, MessageSquare } from 'lucide-react';
import RequireAuth from '../components/RequireAuth';

export default function ChauffeurDashboard() {
  const [currentMission, setCurrentMission] = useState(null);
  const [upcomingMissions, setUpcomingMissions] = useState([]);
  const [todayStats, setTodayStats] = useState({
    completedDeliveries: 0,
    totalDistance: 0,
    earnings: 0,
    onTimeRate: 0
  });

  useEffect(() => {
    // Simulation des données - remplacer par de vrais appels API
    setCurrentMission({
      id: 'M001',
      client: 'Entreprise ABC',
      pickup: 'Dakar, Plateau',
      delivery: 'Thiès, Centre-ville',
      status: 'en_cours',
      estimatedTime: '45 min',
      distance: '68 km'
    });
    
    setUpcomingMissions([
      { id: 'M002', client: 'Shop XYZ', pickup: 'Rufisque', delivery: 'Bargny', time: '14:30' },
      { id: 'M003', client: 'Boutique 123', pickup: 'Guédiawaye', delivery: 'Pikine', time: '16:00' }
    ]);
    
    setTodayStats({
      completedDeliveries: 8,
      totalDistance: 245,
      earnings: 28500,
      onTimeRate: 94
    });
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700"
    };

    return (
      <div className={`p-4 rounded-xl border-2 ${colorClasses[color]} hover:shadow-lg transition-all duration-200`}>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-5 w-5" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const MissionCard = ({ mission, isCurrent = false }) => (
    <div className={`p-4 rounded-lg border-2 ${
      isCurrent ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
    } hover:shadow-md transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <Truck className={`h-4 w-4 ${isCurrent ? 'text-green-600' : 'text-gray-600'}`} />
          <span className="font-semibold text-sm">{mission.client}</span>
        </div>
        {isCurrent && (
          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            En cours
          </span>
        )}
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-blue-500" />
          <span className="text-gray-600">Départ: {mission.pickup}</span>
        </div>
        <div className="flex items-center gap-2">
          <Navigation className="h-3 w-3 text-red-500" />
          <span className="text-gray-600">Arrivée: {mission.delivery}</span>
        </div>
        {isCurrent ? (
          <div className="flex items-center gap-4 mt-3">
            <span className="flex items-center gap-1 text-blue-600">
              <Clock className="h-3 w-3" />
              {mission.estimatedTime}
            </span>
            <span className="text-gray-600">{mission.distance}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <Clock className="h-3 w-3 text-orange-500" />
            <span className="text-orange-600 font-medium">{mission.time}</span>
          </div>
        )}
      </div>
      {isCurrent && (
        <div className="flex gap-2 mt-4">
          <button className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
            Marquer livré
          </button>
          <button className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Phone className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-600 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Chauffeur</h1>
            </div>
            <p className="text-gray-600">Gérez vos livraisons et suivez vos performances</p>
          </div>

          {/* Stats Today */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={CheckCircle} 
              title="Livraisons" 
              value={todayStats.completedDeliveries} 
              subtitle="Aujourd'hui"
              color="green"
            />
            <StatCard 
              icon={Navigation} 
              title="Distance" 
              value={`${todayStats.totalDistance} km`} 
              subtitle="Parcourue"
              color="blue"
            />
            <StatCard 
              icon={Clock} 
              title="Ponctualité" 
              value={`${todayStats.onTimeRate}%`} 
              subtitle="À l'heure"
              color="orange"
            />
            <StatCard 
              icon={Truck} 
              title="Gains" 
              value={`${todayStats.earnings.toLocaleString()} F`} 
              subtitle="Aujourd'hui"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Current Mission */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-green-600" />
                  Mission en cours
                </h2>
                {currentMission ? (
                  <MissionCard mission={currentMission} isCurrent={true} />
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune mission en cours</p>
                  </div>
                )}
              </div>

              {/* Upcoming Missions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  Prochaines missions
                </h2>
                <div className="space-y-4">
                  {upcomingMissions.map(mission => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions & Notifications */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                <div className="space-y-3">
                  <button className="w-full p-3 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Partager position</p>
                        <p className="text-sm text-gray-600">Envoyer ma localisation</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Signaler problème</p>
                        <p className="text-sm text-gray-600">Incident ou retard</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Recent Notifications */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Notifications</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">Nouvelle mission assignée</p>
                    <p className="text-xs text-blue-700 mt-1">Livraison prévue à 16:00</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Paiement reçu</p>
                    <p className="text-xs text-green-700 mt-1">Mission M001 - 15,000 FCFA</p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <p className="text-sm font-medium text-orange-900">Rappel maintenance</p>
                    <p className="text-xs text-orange-700 mt-1">Vérification véhicule due</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
