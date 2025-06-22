import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useMissionActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateMission = async (id: string, updates: any) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase
      .from("missions")
      .update(updates)
      .eq("id", id);
    setLoading(false);
    if (error) setError(error.message);
    return !error;
  };

  const acceptMission = (id: string) => updateMission(id, { status: "acceptée", accepted_at: new Date().toISOString() });
  const refuseMission = (id: string) => updateMission(id, { status: "refusée", refused_at: new Date().toISOString() });
  const startMission = (id: string) => updateMission(id, { status: "en_cours", started_at: new Date().toISOString() });
  const completeMission = (id: string, signature: string) => updateMission(id, { status: "terminée", signature, completed_at: new Date().toISOString() });

  return { acceptMission, refuseMission, startMission, completeMission, loading, error };
}
