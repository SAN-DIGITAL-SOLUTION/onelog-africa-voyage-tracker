
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  FileText, 
  Bell, 
  Map, 
  TrendingUp, 
  Calendar,
  Package,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuth();
  const { role, loadingRole } = useRole();
  const navigate = useNavigate();

  // Gérer la redirection selon le rôle
  useEffect(() => {
    if (!loadingRole && user) {
      console.log("Dashboard - Rôle de l'utilisateur:", role);
      
      // Si l'utilisateur n'a pas de rôle, on le redirige vers la page no-role
      if (role === null) {
        navigate("/no-role", { replace: true });
        return;
      }
      
      // Pour l'instant, on reste sur le dashboard pour tous les rôles
      // Plus tard, on pourra créer des dashboards spécifiques par rôle
    }
  }, [role, loadingRole, user, navigate]);

  if (loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full" />
      </div>
    );
  }

  // Si pas de rôle, on laisse l'useEffect gérer la redirection
  if (role === null) {
    return null;
  }

  return (
    <main className="container mx-auto pt-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Tableau de bord</h1>
        <p className="text-gray-600">
          Bienvenue sur OneLog Africa - Gérez vos opérations logistiques
        </p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Truck className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Missions actives</p>
              <p className="text-2xl font-bold">12</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Missions terminées</p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold">6</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Performance</p>
              <p className="text-2xl font-bold">96%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-3">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/missions/new">
                <Truck className="mr-2 h-4 w-4" />
                Nouvelle mission
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/missions">
                <FileText className="mr-2 h-4 w-4" />
                Voir toutes les missions
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/tracking">
                <Map className="mr-2 h-4 w-4" />
                Suivi en temps réel
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Notifications récentes</h3>
          <div className="space-y-3">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">Mission M-2024-001</p>
              <p className="text-xs text-gray-600">Livraison terminée avec succès</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-sm font-medium">Mission M-2024-002</p>
              <p className="text-xs text-gray-600">En cours de livraison</p>
            </div>
            <Button asChild className="w-full" variant="outline" size="sm">
              <Link to="/notifications">
                <Bell className="mr-2 h-4 w-4" />
                Voir toutes
              </Link>
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Missions du jour</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">M-2024-003</p>
                <p className="text-xs text-gray-600">Dakar → Thiès</p>
              </div>
              <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                En cours
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium">M-2024-004</p>
                <p className="text-xs text-gray-600">Saint-Louis → Dakar</p>
              </div>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                Planifiée
              </span>
            </div>
            <Button asChild className="w-full" variant="outline" size="sm">
              <Link to="/missions">
                <Calendar className="mr-2 h-4 w-4" />
                Voir planning
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
