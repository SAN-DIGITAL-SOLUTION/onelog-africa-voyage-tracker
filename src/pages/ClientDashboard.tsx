import { useEffect, useState } from 'react';
import { Package, Truck, FileText, Clock, MapPin, Plus, Eye, Download, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';

export default function ClientDashboard() {
  const [recentMissions, setRecentMissions] = useState([]);
  const [pendingInvoices, setPendingInvoices] = useState([]);
  const [stats, setStats] = useState({
    totalMissions: 0,
    activeMissions: 0,
    completedMissions: 0,
    totalSpent: 0
  });

  useEffect(() => {
    // Simulation des données - remplacer par de vrais appels API
    setRecentMissions([
      {
        id: 'M001',
        reference: 'CMD-2024-001',
        pickup: 'Dakar, Plateau',
        delivery: 'Thiès, Centre-ville',
        status: 'en_cours',
        driver: 'Mamadou Diallo',
        estimatedDelivery: '14:30',
        trackingCode: 'TRK001'
      },
      {
        id: 'M002',
        reference: 'CMD-2024-002',
        pickup: 'Rufisque, Port',
        delivery: 'Bargny, Marché',
        status: 'livree',
        driver: 'Fatou Sall',
        deliveredAt: 'Hier 16:45'
      }
    ]);
    
    setPendingInvoices([
      { id: 'INV001', reference: 'FACT-001', amount: 25000, dueDate: '2024-08-30', mission: 'CMD-2024-001' },
      { id: 'INV002', reference: 'FACT-002', amount: 18500, dueDate: '2024-09-05', mission: 'CMD-2024-002' }
    ]);
    
    setStats({
      totalMissions: 47,
      activeMissions: 3,
      completedMissions: 44,
      totalSpent: 1250000
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
      <div className={`p-6 rounded-xl border-2 ${colorClasses[color]} hover:shadow-lg transition-all duration-200`}>
        <div className="flex items-center gap-3 mb-3">
          <Icon className="h-6 w-6" />
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div>
          <p className="text-3xl font-bold mb-1">{value}</p>
          {subtitle && <p className="text-sm opacity-75">{subtitle}</p>}
        </div>
      </div>
    );
  };

  const MissionCard = ({ mission }) => {
    const statusConfig = {
      'en_cours': { color: 'bg-blue-50 border-blue-200 text-blue-700', label: 'En cours', icon: Truck },
      'livree': { color: 'bg-green-50 border-green-200 text-green-700', label: 'Livrée', icon: Package },
      'en_attente': { color: 'bg-orange-50 border-orange-200 text-orange-700', label: 'En attente', icon: Clock }
    };
    
    const config = statusConfig[mission.status] || statusConfig['en_attente'];
    const StatusIcon = config.icon;

    return (
      <div className={`p-4 rounded-lg border-2 ${config.color} hover:shadow-md transition-all duration-200`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-semibold text-sm">{mission.reference}</h4>
            <p className="text-xs opacity-75">Chauffeur: {mission.driver}</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusIcon className="h-4 w-4" />
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        </div>
        
        <div className="space-y-2 text-sm mb-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-blue-500" />
            <span className="text-gray-600">De: {mission.pickup}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-red-500" />
            <span className="text-gray-600">Vers: {mission.delivery}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs">
            {mission.status === 'en_cours' ? (
              <span className="text-blue-600 font-medium">Livraison: {mission.estimatedDelivery}</span>
            ) : (
              <span className="text-green-600">Livré: {mission.deliveredAt}</span>
            )}
          </div>
          {mission.trackingCode && (
            <button className="text-xs bg-white px-2 py-1 rounded border hover:bg-gray-50 transition-colors">
              Suivre
            </button>
          )}
        </div>
      </div>
    );
  };

  const InvoiceCard = ({ invoice }) => (
    <div className="p-4 bg-white border-2 border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-sm">{invoice.reference}</h4>
          <p className="text-xs text-gray-600">Mission: {invoice.mission}</p>
        </div>
        <span className="text-lg font-bold text-gray-900">{invoice.amount.toLocaleString()} F</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-xs text-orange-600">Échéance: {invoice.dueDate}</span>
        <div className="flex gap-2">
          <button className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
            <Eye className="h-3 w-3 inline mr-1" />
            Voir
          </button>
          <button className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded hover:bg-green-100 transition-colors">
            <Download className="h-3 w-3 inline mr-1" />
            PDF
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <RequireAuth>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Client</h1>
            </div>
            <p className="text-gray-600">Suivez vos expéditions et gérez vos commandes</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard 
              icon={Package} 
              title="Total missions" 
              value={stats.totalMissions} 
              subtitle="Depuis le début"
              color="blue"
            />
            <StatCard 
              icon={Truck} 
              title="En cours" 
              value={stats.activeMissions} 
              subtitle="Actuellement"
              color="orange"
            />
            <StatCard 
              icon={Package} 
              title="Terminées" 
              value={stats.completedMissions} 
              subtitle="Livrées avec succès"
              color="green"
            />
            <StatCard 
              icon={CreditCard} 
              title="Total dépensé" 
              value={`${stats.totalSpent.toLocaleString()} F`} 
              subtitle="Ce mois"
              color="purple"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Missions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-600" />
                    Missions récentes
                  </h2>
                  <Link to="/demande-client" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    <Plus className="h-4 w-4" />
                    Nouvelle mission
                  </Link>
                </div>
                <div className="space-y-4">
                  {recentMissions.map(mission => (
                    <MissionCard key={mission.id} mission={mission} />
                  ))}
                </div>
              </div>
            </div>

            {/* Invoices & Quick Actions */}
            <div className="space-y-6">
              {/* Pending Invoices */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-600" />
                  Factures en attente
                </h2>
                <div className="space-y-3">
                  {pendingInvoices.map(invoice => (
                    <InvoiceCard key={invoice.id} invoice={invoice} />
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                <div className="space-y-3">
                  <Link to="/demande-client" className="block w-full p-3 bg-blue-50 border-2 border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <Plus className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Créer une mission</p>
                        <p className="text-sm text-gray-600">Nouvelle expédition</p>
                      </div>
                    </div>
                  </Link>
                  <button className="w-full p-3 bg-green-50 border-2 border-green-200 rounded-lg hover:bg-green-100 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Suivre expédition</p>
                        <p className="text-sm text-gray-600">Localisation en temps réel</p>
                      </div>
                    </div>
                  </button>
                  <button className="w-full p-3 bg-purple-50 border-2 border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-gray-900">Historique factures</p>
                        <p className="text-sm text-gray-600">Consulter les paiements</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}
