import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useIncident() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createIncident = async (missionId: string, description: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    const user = supabase.auth.user();
    if (!user) return;
    const { error } = await supabase
      .from("incidents")
      .insert([
        {
          mission_id: missionId,
          chauffeur_id: user.id,
          description,
          created_at: new Date().toISOString(),
        },
      ]);
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess(true);
  };

  return { createIncident, loading, error, success };
}
