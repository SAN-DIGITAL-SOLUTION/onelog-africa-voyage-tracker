import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useMissionsChauffeur() {
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      setLoading(true);
      setError(null);
      const user = supabase.auth.user();
      if (!user) return;
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("chauffeur_id", user.id)
        .not("status", "eq", "terminée")
        .order("created_at", { ascending: false });
      if (error) setError(error.message);
      setMissions(data || []);
      setLoading(false);
    };
    fetchMissions();
  }, []);

  return { missions, loading, error };
}
