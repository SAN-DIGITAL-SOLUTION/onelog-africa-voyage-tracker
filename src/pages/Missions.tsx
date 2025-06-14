
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";

export default function Missions() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch missions from Supabase for the authenticated user
  const { data: missions, isLoading } = useQuery({
    queryKey: ["missions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  return (
    <RequireAuth>
      <main className="container mx-auto pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Missions</h1>
          <button
            className="flex items-center gap-2 bg-onelog-bleu text-white font-bold px-4 py-2 rounded shadow hover:scale-105 transition-all"
            onClick={() => navigate("/missions/new")}
          >
            <Plus size={20} /> Nouvelle mission
          </button>
        </div>
        <table className="w-full border rounded-lg bg-white shadow-sm">
          <thead>
            <tr className="bg-onelog-nuit/90 text-white">
              <th className="py-2 px-3 text-left">Référence</th>
              <th className="py-2 px-3 text-left">Client</th>
              <th className="py-2 px-3 text-left">Chauffeur</th>
              <th className="py-2 px-3 text-left">Date</th>
              <th className="py-2 px-3 text-left">Statut</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="text-center py-8">
                  <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
                </td>
              </tr>
            ) : missions && missions.length > 0 ? (
              missions.map((m: any) => (
                <tr
                  className="border-b last:border-none hover:bg-onelog-bleu/5 transition"
                  key={m.id}
                >
                  <td className="py-2 px-3">{m.ref}</td>
                  <td className="py-2 px-3">{m.client}</td>
                  <td className="py-2 px-3">{m.chauffeur}</td>
                  <td className="py-2 px-3">{m.date}</td>
                  <td className="py-2 px-3">
                    <span
                      className={
                        "px-2 py-1 rounded text-sm font-semibold " +
                        (m.status === "En cours"
                          ? "bg-onelog-citron/60 text-onelog-nuit"
                          : "bg-onelog-bleu/20 text-onelog-bleu")
                      }
                    >
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/missions/${m.id}`)}
                      className="p-1 rounded hover:bg-onelog-bleu/10"
                      title="Voir le détail"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-8 text-onelog-nuit/60">
                  Aucune mission trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </main>
    </RequireAuth>
  );
}
