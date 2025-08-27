import { useEffect, useState } from 'react';
import { Truck, Users, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, Package, MapPin, Phone, Settings } from 'lucide-react';
import RequireAuth from '../components/RequireAuth';

export default function QADashboard() {
  const [stats, setStats] = useState({
    totalDemandes: 0,
    demandesEnAttente: 0,
    missionsActives: 0,
    chauffeursDispo: 0,
    chiffreAffaires: 0,
    demandesTraitees: 0
  });

  useEffect(() => {
    // Simulation des données - remplacer par de vrais appels API
    setStats({
      totalDemandes: 89,
      demandesEnAttente: 12,
      missionsActives: 18,
      chauffeursDispo: 7,
      chiffreAffaires: 125000,
      demandesTraitees: 77
    });
  }, []);

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "blue" }) => {
    const colorClasses = {
      blue: "bg-blue-50 border-blue-200 text-blue-700",
      green: "bg-green-50 border-green-200 text-green-700",
      orange: "bg-orange-50 border-orange-200 text-orange-700",
      purple: "bg-purple-50 border-purple-200 text-purple-700",
      red: "bg-red-50 border-red-200 text-red-700"
    };

    return (
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} hover:shadow-lg transition-all duration-200 hover:scale-105`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg bg-white shadow-sm`}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <div>
          <h3 className="text-2xl font-bold mb-1">{value}</h3>
          <p className="text-sm opacity-75">{title}</p>
          {subtitle && <p className="text-xs mt-1 opacity-60">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const QuickAction = ({ icon: Icon, title, description, onClick, color = "blue" }) => {
    const colorClasses = {
      blue: "hover:bg-blue-50 border-blue-200",
      green: "hover:bg-green-50 border-green-200",
      orange: "hover:bg-orange-50 border-orange-200"
    };

    return (
      <button 
        onClick={onClick}
        className={`p-4 rounded-lg border-2 bg-white ${colorClasses[color]} transition-all duration-200 hover:shadow-md text-left w-full`}
      >
        <div className="flex items-start gap-3">
          <Icon className="h-5 w-5 mt-1 text-gray-600" />
          <div>
            <h4 className="font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
        </div>
      </button>
    );
  };

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-600 rounded-lg">
                <Truck className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Exploiteur</h1>
            </div>
            <p className="text-gray-600">Gérez les demandes de transport et supervisez vos opérations</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <StatCard 
              icon={FileText} 
              title="Demandes totales" 
              value={stats.totalDemandes} 
              subtitle="Ce mois"
              trend={12.5}
              color="blue"
            />
            <StatCard 
              icon={AlertCircle} 
              title="En attente" 
              value={stats.demandesEnAttente} 
              subtitle="À traiter"
              trend={null}
              color="orange"
            />
            <StatCard 
              icon={Truck} 
              title="Missions actives" 
              value={stats.missionsActives} 
              subtitle="En cours"
              trend={8.3}
              color="green"
            />
            <StatCard 
              icon={Users} 
              title="Chauffeurs disponibles" 
              value={stats.chauffeursDispo} 
              subtitle="Prêts à partir"
              trend={null}
              color="purple"
            />
            <StatCard 
              icon={DollarSign} 
              title="Chiffre d'affaires" 
              value={`${stats.chiffreAffaires.toLocaleString()} FCFA`} 
              subtitle="Ce mois"
              trend={15.2}
              color="green"
            />
            <StatCard 
              icon={CheckCircle} 
              title="Demandes traitées" 
              value={stats.demandesTraitees} 
              subtitle="Validées/Affectées"
              trend={18.7}
              color="blue"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Actions rapides
              </h2>
              <div className="space-y-3">
                <QuickAction 
                  icon={FileText}
                  title="Gérer les demandes"
                  description="Valider ou rejeter les nouvelles demandes"
                  onClick={() => console.log('Gérer demandes')}
                  color="blue"
                />
                <QuickAction 
                  icon={Users}
                  title="Affecter chauffeurs"
                  description="Assigner des chauffeurs aux missions validées"
                  onClick={() => console.log('Affecter chauffeurs')}
                  color="green"
                />
                <QuickAction 
                  icon={MapPin}
                  title="Suivre les livraisons"
                  description="Monitoring en temps réel des missions"
                  onClick={() => console.log('Suivre livraisons')}
                  color="orange"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Activité récente
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Nouvelle demande reçue</p>
                    <p className="text-xs text-gray-600">Transport Dakar-Thiès - il y a 15min</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Mission terminée</p>
                    <p className="text-xs text-gray-600">Livraison Rufisque-Bargny - il y a 1h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Chauffeur disponible</p>
                    <p className="text-xs text-gray-600">Mamadou D. - Prêt pour nouvelle mission</p>
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
