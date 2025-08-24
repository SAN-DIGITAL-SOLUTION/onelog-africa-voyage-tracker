import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RoleRequest {
  user_id: string;
  requested_role: string;
  role_status: string;
  email?: string;
}

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
        usersMap = Object.fromEntries(users.map((u: any) => [u.id, u.email]));
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
    <main className="container mx-auto pt-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Demandes de rôles en attente</h1>
      {loading && <div>Chargement…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && requests.length === 0 && <div>Aucune demande en attente.</div>}
      <ul className="space-y-4">
        {requests.map(req => (
          <li key={req.user_id} className="p-4 border rounded flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <div><span className="font-semibold">Utilisateur :</span> {req.email || req.user_id}</div>
              <div><span className="font-semibold">Demande :</span> {req.requested_role}</div>
              <div><span className="font-semibold">Statut :</span> {req.role_status}</div>
            </div>
            <div className="mt-2 md:mt-0 flex gap-2">
              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() => handleDecision(req.user_id, req.requested_role, true)}
                disabled={loading}
              >
                Approuver
              </button>
              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleDecision(req.user_id, req.requested_role, false)}
                disabled={loading}
              >
                Rejeter
              </button>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
