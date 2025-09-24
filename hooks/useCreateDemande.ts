import { useState } from "react";
import { supabase } from "@/services/supabaseClient";
import { v4 as uuidv4 } from "uuid";

export function useCreateDemande() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createDemande = async (data: any) => {
    setLoading(true);
    setError(null);
    const user = supabase.auth.user();
    if (!user) {
      setError("Vous devez être connecté.");
      setLoading(false);
      return null;
    }
    // Générer un trackingId unique
    const trackingId = uuidv4();
    const { data: inserted, error: insertError } = await supabase
      .from("demandes")
      .insert([
        { ...data, userId: user.id, status: "en_attente", trackingId }
      ])
      .single();
    setLoading(false);
    if (insertError) setError(insertError.message);
    return inserted;
  };

  return { createDemande, loading, error };
}
