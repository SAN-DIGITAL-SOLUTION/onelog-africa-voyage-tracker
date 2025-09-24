import { useState, useEffect } from "react";
import { Truck, Clock, CheckCircle, AlertTriangle, MapPin, Phone, User } from "lucide-react";
import { Button, Badge } from "@/components/ui";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import RequireAuth from "@/components/RequireAuth";

// Mock data pour les missions chauffeur
const mockMissions = [
  {
    id: "1",
    ref: "M-2024-001",
    client: "Transport Express SARL",
    pickup: "Dakar, Plateau",
    delivery: "Thiès, Centre-ville",
    status: "assigned",
    priority: "high",
    scheduledDate: "2024-01-15",
    estimatedDuration: "2h 30min",
    cargo: "Matériel informatique",
    weight: "150 kg",
    contactClient: "+221 77 123 45 67"
  },
  {
    id: "2", 
    ref: "M-2024-002",
    client: "Logistics Pro",
    pickup: "Rufisque, Zone industrielle",
    delivery: "Saint-Louis, Port",
    status: "in_progress",
    priority: "medium",
    scheduledDate: "2024-01-15",
    estimatedDuration: "4h 15min",
    cargo: "Pièces automobiles",
    weight: "320 kg",
    contactClient: "+221 76 987 65 43"
  },
  {
    id: "3",
    ref: "M-2024-003", 
    client: "Commerce International",
    pickup: "Kaolack, Marché central",
    delivery: "Ziguinchor, Entrepôt Sud",
    status: "completed",
    priority: "low",
    scheduledDate: "2024-01-14",
    estimatedDuration: "6h 00min",
    cargo: "Produits alimentaires",
    weight: "500 kg",
    contactClient: "+221 78 456 78 90"
  }
];

const statusConfig = {
  assigned: { 
    label: "Assignée", 
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock 
  },
  in_progress: { 
    label: "En cours", 
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: Truck 
  },
  completed: { 
    label: "Terminée", 
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle 
  }
};

const priorityConfig = {
  high: { label: "Haute", color: "bg-red-100 text-red-800" },
  medium: { label: "Moyenne", color: "bg-yellow-100 text-yellow-800" },
  low: { label: "Basse", color: "bg-gray-100 text-gray-800" }
};

export default function MissionsChauffeur() {
  const { user } = useAuth();
  const [missions, setMissions] = useState(mockMissions);
  const [selectedMission, setSelectedMission] = useState(null);

  const handleMissionAction = (missionId: string, action: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId) {
        switch (action) {
          case 'accept':
            return { ...mission, status: 'in_progress' };
          case 'complete':
            return { ...mission, status: 'completed' };
          default:
            return mission;
        }
      }
      return mission;
    }));
  };

  const getActionButtons = (mission) => {
    switch (mission.status) {
      case 'assigned':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleMissionAction(mission.id, 'accept')}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="sm"
            >
              <CheckCircle size={16} className="mr-1" />
              Accepter
            </Button>
            <Button variant="outline" size="sm">
              <AlertTriangle size={16} className="mr-1" />
              Signaler un problème
            </Button>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex gap-2">
            <Button 
              onClick={() => handleMissionAction(mission.id, 'complete')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              size="sm"
            >
              <CheckCircle size={16} className="mr-1" />
              Terminer
            </Button>
            <Button variant="outline" size="sm">
              <MapPin size={16} className="mr-1" />
              Localisation
            </Button>
          </div>
        );
      case 'completed':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Mission terminée
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <RequireAuth>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 border border-gray-100 max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl shadow-lg">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes missions (Chauffeur)</h1>
                <p className="text-gray-600 text-lg">
                  Gérez vos missions assignées et suivez vos livraisons
                </p>
              </div>
            </div>

            {/* Stats rapides */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Assignées</p>
                    <p className="text-xl font-bold text-blue-800">
                      {missions.filter(m => m.status === 'assigned').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">En cours</p>
                    <p className="text-xl font-bold text-orange-800">
                      {missions.filter(m => m.status === 'in_progress').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Terminées</p>
                    <p className="text-xl font-bold text-green-800">
                      {missions.filter(m => m.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des missions */}
          <div className="space-y-6 max-w-7xl mx-auto">
            {missions.map((mission) => {
              const StatusIcon = statusConfig[mission.status]?.icon || Clock;
              
              return (
                <Card key={mission.id} className="bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                          {mission.ref}
                        </CardTitle>
                        <CardDescription className="text-gray-600 text-base">
                          {mission.client}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={statusConfig[mission.status]?.color}>
                          <StatusIcon size={14} className="mr-1" />
                          {statusConfig[mission.status]?.label}
                        </Badge>
                        <Badge className={priorityConfig[mission.priority]?.color}>
                          {priorityConfig[mission.priority]?.label}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-green-600 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">Enlèvement</p>
                            <p className="text-gray-600">{mission.pickup}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <MapPin className="w-5 h-5 text-red-600 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">Livraison</p>
                            <p className="text-gray-600">{mission.delivery}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-start gap-3">
                          <Phone className="w-5 h-5 text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-gray-900">Contact client</p>
                            <p className="text-gray-600">{mission.contactClient}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">Détails de la mission</h4>
                          <div className="space-y-2 text-sm">
                            <p><span className="font-medium">Marchandise:</span> {mission.cargo}</p>
                            <p><span className="font-medium">Poids:</span> {mission.weight}</p>
                            <p><span className="font-medium">Date prévue:</span> {mission.scheduledDate}</p>
                            <p><span className="font-medium">Durée estimée:</span> {mission.estimatedDuration}</p>
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          {getActionButtons(mission)}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
