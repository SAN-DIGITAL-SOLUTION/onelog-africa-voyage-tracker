import { useEffect, useState } from 'react';
import { Users, Truck, FileText, TrendingUp, AlertCircle, CheckCircle, Clock, DollarSign, BarChart3, Settings, Shield } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RequireAuth from '../components/RequireAuth';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMissions: 0,
    pendingInvoices: 0,
    monthlyRevenue: 0,
    pendingApprovals: 0,
    completedMissions: 0
  });

  useEffect(() => {
    // Simulation des données - remplacer par de vrais appels API
    setStats({
      totalUsers: 156,
      activeMissions: 23,
      pendingInvoices: 8,
      monthlyRevenue: 45600,
      pendingApprovals: 5,
      completedMissions: 142
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
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-indigo-50">
        <div className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          {/* Header avec design amélioré */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Administrateur</h1>
                  <p className="text-gray-600 text-lg">
                    Vue d'ensemble et gestion complète de la plateforme OneLog Africa
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <Button
                  onClick={() => navigate('/admin/settings')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  <Settings size={18} className="mr-2" />
                  Paramètres
                </Button>
              </div>
            </div>
            
            {/* Indicateurs de performance */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Croissance</p>
                    <p className="text-xl font-bold text-green-800">+12.8%</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Utilisateurs actifs</p>
                    <p className="text-xl font-bold text-blue-800">156</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Truck className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Missions actives</p>
                    <p className="text-xl font-bold text-purple-800">23</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Alertes</p>
                    <p className="text-xl font-bold text-orange-800">5</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid avec design amélioré */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-xl">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+8.2%</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-600">Utilisateurs actifs</p>
                <p className="text-xs text-gray-500 mt-1">+12 ce mois</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <Truck className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+15.3%</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeMissions}</h3>
                <p className="text-sm text-gray-600">Missions actives</p>
                <p className="text-xs text-gray-500 mt-1">En cours de livraison</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-xl">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <span className="text-sm font-medium text-red-600 bg-red-50 px-2 py-1 rounded-full">-5.1%</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingInvoices}</h3>
                <p className="text-sm text-gray-600">Factures en attente</p>
                <p className="text-xs text-gray-500 mt-1">À valider</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-violet-100 rounded-xl">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+12.8%</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.monthlyRevenue.toLocaleString()} FCFA</h3>
                <p className="text-sm text-gray-600">Chiffre d'affaires</p>
                <p className="text-xs text-gray-500 mt-1">Ce mois</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-xl">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.pendingApprovals}</h3>
                <p className="text-sm text-gray-600">Demandes d'approbation</p>
                <p className="text-xs text-gray-500 mt-1">Rôles en attente</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-200">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">+22.1%</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.completedMissions}</h3>
                <p className="text-sm text-gray-600">Missions terminées</p>
                <p className="text-xs text-gray-500 mt-1">Ce mois</p>
              </div>
            </div>
          </div>

          {/* Actions et Activité */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Actions rapides</h2>
              </div>
              <div className="space-y-4">
                <Button
                  onClick={() => navigate('/admin/role-requests')}
                  className="w-full p-4 rounded-xl border-2 border-blue-200 hover:bg-blue-50 transition-all duration-200 hover:shadow-md text-left bg-white text-gray-900 hover:text-gray-900 justify-start h-auto"
                  variant="ghost"
                >
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 mt-1 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Gérer les utilisateurs</h4>
                      <p className="text-sm text-gray-600 mt-1">Approuver, suspendre ou modifier les comptes</p>
                    </div>
                  </div>
                </Button>
                <Button
                  onClick={() => navigate('/missions')}
                  className="w-full p-4 rounded-xl border-2 border-green-200 hover:bg-green-50 transition-all duration-200 hover:shadow-md text-left bg-white text-gray-900 hover:text-gray-900 justify-start h-auto"
                  variant="ghost"
                >
                  <div className="flex items-start gap-3">
                    <Truck className="h-5 w-5 mt-1 text-green-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Superviser les missions</h4>
                      <p className="text-sm text-gray-600 mt-1">Suivre et gérer toutes les missions en cours</p>
                    </div>
                  </div>
                </Button>
                <Button
                  onClick={() => navigate('/admin/analytics')}
                  className="w-full p-4 rounded-xl border-2 border-purple-200 hover:bg-purple-50 transition-all duration-200 hover:shadow-md text-left bg-white text-gray-900 hover:text-gray-900 justify-start h-auto"
                  variant="ghost"
                >
                  <div className="flex items-start gap-3">
                    <BarChart3 className="h-5 w-5 mt-1 text-purple-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Rapports et analytics</h4>
                      <p className="text-sm text-gray-600 mt-1">Consulter les statistiques détaillées</p>
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Activité récente */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
                  <Clock className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Activité récente</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Nouvelle mission créée</p>
                    <p className="text-xs text-gray-600 mt-1">Par Client ABC - il y a 2h</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Mission terminée</p>
                    <p className="text-xs text-gray-600 mt-1">Livraison Dakar-Thiès - il y a 4h</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Demande d'approbation</p>
                    <p className="text-xs text-gray-600 mt-1">Nouveau chauffeur - il y a 6h</p>
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
