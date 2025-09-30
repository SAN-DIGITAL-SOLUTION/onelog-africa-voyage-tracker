import { BarChart3, TrendingUp, Users, Truck, DollarSign, Calendar } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RequireAuth from "@/components/RequireAuth";

export default function AdminAnalytics() {
  // Mock data for demonstration
  const stats = {
    totalMissions: 156,
    activeMissions: 23,
    completedMissions: 133,
    totalRevenue: 45600000,
    monthlyGrowth: 12.5,
    activeDrivers: 18,
    totalClients: 42
  };

  const recentActivity = [
    { id: 1, type: "mission", description: "Mission M-2024-156 terminée", time: "Il y a 2h", status: "completed" },
    { id: 2, type: "user", description: "Nouveau chauffeur inscrit", time: "Il y a 4h", status: "pending" },
    { id: 3, type: "revenue", description: "Facture F-2024-089 payée", time: "Il y a 6h", status: "paid" },
    { id: 4, type: "mission", description: "Mission M-2024-157 créée", time: "Il y a 8h", status: "active" }
  ];

  const monthlyData = [
    { month: "Jan", missions: 45, revenue: 12500000 },
    { month: "Fév", missions: 52, revenue: 14200000 },
    { month: "Mar", missions: 48, revenue: 13800000 },
    { month: "Avr", missions: 61, revenue: 16900000 },
    { month: "Mai", missions: 58, revenue: 15800000 },
    { month: "Juin", missions: 67, revenue: 18400000 }
  ];

  return (
    <RequireAuth>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-purple-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 border border-gray-100 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl shadow-lg">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapports et Analytics</h1>
                <p className="text-gray-600 text-lg">
                  Tableau de bord des performances et statistiques détaillées
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-blue-600">Total Missions</CardTitle>
                    <Truck className="h-5 w-5 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-800">{stats.totalMissions}</div>
                  <p className="text-xs text-blue-600 mt-1">
                    {stats.activeMissions} actives, {stats.completedMissions} terminées
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-green-600">Chiffre d'affaires</CardTitle>
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-800">
                    {(stats.totalRevenue / 1000000).toFixed(1)}M FCFA
                  </div>
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +{stats.monthlyGrowth}% ce mois
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-orange-600">Chauffeurs actifs</CardTitle>
                    <Users className="h-5 w-5 text-orange-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-800">{stats.activeDrivers}</div>
                  <p className="text-xs text-orange-600 mt-1">Sur {stats.activeDrivers + 5} inscrits</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-purple-600">Clients</CardTitle>
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-800">{stats.totalClients}</div>
                  <p className="text-xs text-purple-600 mt-1">+3 ce mois</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Monthly Performance Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                    Performance mensuelle
                  </CardTitle>
                  <CardDescription>Évolution des missions et revenus</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {monthlyData.map((data, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{data.month}</p>
                            <p className="text-sm text-gray-600">{data.missions} missions</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {(data.revenue / 1000000).toFixed(1)}M FCFA
                          </p>
                          <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                            <div 
                              className="h-2 bg-blue-600 rounded-full" 
                              style={{ width: `${(data.missions / 70) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Activité récente
                  </CardTitle>
                  <CardDescription>Dernières actions sur la plateforme</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'pending' ? 'bg-orange-500' :
                          activity.status === 'paid' ? 'bg-blue-500' :
                          'bg-purple-500'
                        }`}></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-600">{activity.time}</p>
                        </div>
                        <Badge variant={
                          activity.status === 'completed' ? 'default' :
                          activity.status === 'pending' ? 'secondary' :
                          'outline'
                        }>
                          {activity.status === 'completed' ? 'Terminé' :
                           activity.status === 'pending' ? 'En attente' :
                           activity.status === 'paid' ? 'Payé' : 'Actif'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Summary */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Résumé des performances</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">92%</p>
                  <p className="text-sm text-blue-600">Taux de satisfaction client</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">4.2h</p>
                  <p className="text-sm text-blue-600">Temps moyen de livraison</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-800">98%</p>
                  <p className="text-sm text-blue-600">Missions réussies</p>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
