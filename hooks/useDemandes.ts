import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useDemandes(status: string = "en_attente") {
  const [demandes, setDemandes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDemandes = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("demandes")
        .select("*")
        .eq("status", status)
        .order("createdAt", { ascending: false });
      if (error) setError(error.message);
      setDemandes(data || []);
      setLoading(false);
    };
    fetchDemandes();
  }, [status]);

  return { demandes, loading, error };
}
