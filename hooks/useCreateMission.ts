import { useState } from "react";
import { supabase } from "@/services/supabaseClient";

export function useCreateMission() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMission = async ({ demande_id, chauffeur_id, vehicule_id }: { demande_id: string, chauffeur_id: string, vehicule_id?: string }) => {
    setLoading(true);
    setError(null);
    // Vérifier que le chauffeur n'a pas déjà une mission en cours
    const { data: missionsEnCours } = await supabase
      .from("missions")
      .select("id")
      .eq("chauffeur_id", chauffeur_id)
      .eq("status", "en_cours");
    if (missionsEnCours && missionsEnCours.length > 0) {
      setLoading(false);
      setError("Ce chauffeur a déjà une mission en cours.");
      return null;
    }
    // Créer la mission
    const { data: mission, error: missionError } = await supabase
      .from("missions")
      .insert([
        { demande_id, chauffeur_id, vehicule_id, status: "en_cours" }
      ])
      .single();
    setLoading(false);
    if (missionError) setError(missionError.message);
    return mission;
  };

  return { createMission, loading, error };
}
