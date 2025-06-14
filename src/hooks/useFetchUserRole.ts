
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./useRole";

/**
 * Retourne le rôle trouvé, ou null si aucun rôle pour l'utilisateur
 */
export async function fetchUserRole(userId: string): Promise<AppRole> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Erreur lors de la récupération du rôle :", error.message);
    return null;
  }

  if (!data || !data.role) {
    // Aucun rôle trouvé pour cet utilisateur
    return null;
  }
  return data.role as AppRole;
}
