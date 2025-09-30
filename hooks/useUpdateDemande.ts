import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useUpdateDemande() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateDemandeStatus = async (id: string, newStatus: "validée" | "refusée") => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("demandes")
      .update({ status: newStatus })
      .eq("id", id);
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  return { updateDemandeStatus, loading, error };
}
