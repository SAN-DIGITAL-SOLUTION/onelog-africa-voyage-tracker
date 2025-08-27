
import { FileText, Truck, Bell, LayoutDashboard, Plus, Users, MapPin, TrendingUp, Calendar, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import RequireAuth from "@/components/RequireAuth";
import { Button } from "@/components/ui/button";

const stats = [
  {
    title: "Missions actives",
    value: 12,
    icon: Truck,
    color: "from-blue-50 to-cyan-50 border-blue-200",
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    textColor: "text-blue-800",
    link: "/missions"
  },
  {
    title: "Factures émises",
    value: 23,
    icon: FileText,
    color: "from-green-50 to-emerald-50 border-green-200",
    iconColor: "text-green-600", 
    iconBg: "bg-green-100",
    textColor: "text-green-800",
    link: "/invoices"
  },
  {
    title: "Notifications envoyées",
    value: 37,
    icon: Bell,
    color: "from-orange-50 to-amber-50 border-orange-200",
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100", 
    textColor: "text-orange-800",
    link: "/notifications"
  },
];

const quickActions = [
  {
    title: "Nouvelle Mission",
    description: "Créer une nouvelle mission de transport",
    icon: Plus,
    color: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700",
    link: "/missions/new"
  },
  {
    title: "Suivi Live",
    description: "Suivre vos véhicules en temps réel",
    icon: MapPin,
    color: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
    link: "/tracking"
  },
  {
    title: "Gestion Équipe",
    description: "Gérer vos chauffeurs et équipes",
    icon: Users,
    color: "bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700",
    link: "/admin/role-requests"
  },
  {
    title: "Rapports",
    description: "Consulter vos statistiques et rapports",
    icon: TrendingUp,
    color: "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700",
    link: "/admin-dashboard"
  }
];

export default function Dashboard() {
  return (
    <RequireAuth>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          {/* Header moderne avec plus d'impact visuel */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 sm:mb-10 border border-gray-100 max-w-7xl mx-auto">
            <div className="flex flex-col xl:flex-row justify-between items-start gap-6 xl:gap-8 mb-6 xl:mb-8">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                  <LayoutDashboard size={32} className="text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-3">Tableau de bord</h1>
                  <p className="text-gray-600 text-xl">
                    Gérez vos missions, suivez vos chauffeurs en temps réel et facilitez votre facturation sur votre espace OneLog Africa.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} />
                  <span>{new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Stats avec liens fonctionnels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
              {stats.map((stat, idx) => (
                <Link
                  key={idx}
                  to={stat.link}
                  className={`group bg-gradient-to-r ${stat.color} p-6 rounded-xl border hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 ${stat.iconBg} rounded-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon size={24} className={stat.iconColor} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium mb-1 ${stat.iconColor}`}>{stat.title}</p>
                      <p className={`text-2xl font-bold ${stat.textColor}`}>{stat.value}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Actions rapides */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8 sm:mb-10 border border-gray-100 max-w-7xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Actions rapides</h2>
              <p className="text-gray-600">Accédez rapidement aux fonctionnalités principales</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, idx) => (
                <Button
                  key={idx}
                  asChild
                  className={`${action.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 h-auto p-6 flex-col items-start text-left`}
                >
                  <Link to={action.link}>
                    <action.icon size={24} className="mb-3" />
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{action.title}</h3>
                      <p className="text-sm opacity-90">{action.description}</p>
                    </div>
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Call to action pour nouveaux utilisateurs */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 sm:p-8 text-white max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2">Vous débutez ?</h3>
                <p className="text-blue-100 text-lg">
                  Consultez la rubrique missions pour créer votre première opération et découvrir toutes les fonctionnalités de OneLog Africa.
                </p>
              </div>
              <Button
                asChild
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-4 text-lg font-semibold"
              >
                <Link to="/missions/new">
                  <Plus size={20} className="mr-3" />
                  Créer ma première mission
                </Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
