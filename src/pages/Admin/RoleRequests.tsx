import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Mail, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";

interface RoleRequest {
  user_id: string;
  requested_role: string;
  role_status: string;
  email?: string;
}

const roleLabels = {
  admin: "Administrateur",
  exploiteur: "Exploiteur",
  chauffeur: "Chauffeur",
  client: "Client"
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  exploiteur: "bg-blue-100 text-blue-800", 
  chauffeur: "bg-green-100 text-green-800",
  client: "bg-purple-100 text-purple-800"
};

export default function RoleRequests() {
  const [requests, setRequests] = useState<RoleRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, requested_role, role_status")
        .eq("role_status", "pending");
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      // Optionally fetch user email for display
      const userIds = data.map((r: RoleRequest) => r.user_id);
      let usersMap: Record<string, string> = {};
      if (userIds.length) {
        const { data: users } = await supabase
          .from("users")
          .select("id, email")
          .in("id", userIds);
        usersMap = Object.fromEntries(users?.map((u: any) => [u.id, u.email]) || []);
      }
      setRequests(data.map((r: RoleRequest) => ({ ...r, email: usersMap[r.user_id] })));
      setLoading(false);
    }
    fetchRequests();
  }, []);

  async function handleDecision(user_id: string, requested_role: string, approve: boolean) {
    setLoading(true);
    setError(null);
    const update = approve
      ? { role: requested_role, role_status: "approved", requested_role: null }
      : { role_status: "rejected" };
    const { error } = await supabase
      .from("user_roles")
      .update(update)
      .eq("user_id", user_id);
    if (error) setError(error.message);
    else setRequests(reqs => reqs.filter(r => r.user_id !== user_id));
    setLoading(false);
  }

  return (
    <RequireAuth>
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-blue-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 lg:p-10 mb-8 border border-gray-100 max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des utilisateurs</h1>
                <p className="text-gray-600 text-lg">
                  Approuver ou rejeter les demandes de rôles en attente
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <Clock className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="text-sm text-orange-600 font-medium">En attente</p>
                    <p className="text-xl font-bold text-orange-800">{requests.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Approuvées</p>
                    <p className="text-xl font-bold text-green-800">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-xl border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Rejetées</p>
                    <p className="text-xl font-bold text-red-800">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading && (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}
            
            {!loading && requests.length === 0 && (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande en attente</h3>
                <p className="text-gray-600">Toutes les demandes de rôles ont été traitées.</p>
              </div>
            )}

            <div className="space-y-4">
              {requests.map(req => (
                <Card key={req.user_id} className="bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg font-semibold text-gray-900 mb-1">
                          Demande de rôle
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-gray-600">
                          <Mail className="w-4 h-4" />
                          {req.email || req.user_id}
                        </CardDescription>
                      </div>
                      <Badge className={roleColors[req.requested_role] || "bg-gray-100 text-gray-800"}>
                        {roleLabels[req.requested_role] || req.requested_role}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Rôle demandé:</span> {roleLabels[req.requested_role] || req.requested_role}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Statut:</span> En attente d'approbation
                        </p>
                      </div>
                      
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          onClick={() => handleDecision(req.user_id, req.requested_role, true)}
                          disabled={loading}
                          className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approuver
                        </Button>
                        <Button
                          onClick={() => handleDecision(req.user_id, req.requested_role, false)}
                          disabled={loading}
                          variant="destructive"
                          className="flex-1 sm:flex-none"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Rejeter
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
