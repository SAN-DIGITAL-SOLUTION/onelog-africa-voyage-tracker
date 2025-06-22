import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/services/supabaseClient";
import { useMissionsChauffeur } from "@/hooks/useMissionsChauffeur";
import MissionCard from "@/components/MissionCard";

export default function MissionsChauffeur() {
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  const { missions, loading, error } = useMissionsChauffeur();

  useEffect(() => {
    const fetchRole = async () => {
      const user = supabase.auth.user();
      if (!user) { navigate("/auth"); return; }
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (error || !data || data.role !== "chauffeur") {
        navigate("/404");
        return;
      }
      setRole(data.role);
    };
    fetchRole();
  }, [navigate]);

  if (!role) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2">
      <h1 className="text-2xl font-bold text-center mb-6">Mes missions</h1>
      {loading && <p>Chargement...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="max-w-2xl mx-auto">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
        {missions.length === 0 && !loading && <p className="text-gray-500 text-center">Aucune mission en cours</p>}
      </div>
    </div>
  );
}
