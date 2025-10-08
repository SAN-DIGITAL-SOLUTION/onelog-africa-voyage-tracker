import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useChauffeursDisponibles() {
  const [chauffeurs, setChauffeurs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChauffeurs = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nom, prenom, phone, statut, role")
        .eq("role", "chauffeur")
        .eq("statut", "disponible");
      if (error) setError(error.message);
      setChauffeurs(data || []);
      setLoading(false);
    };
    fetchChauffeurs();
  }, []);

  return { chauffeurs, loading, error };
}
