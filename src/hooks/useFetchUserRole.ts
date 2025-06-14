
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

/**
 * Crée ou met à jour le rôle d'un utilisateur dans la table user_roles.
 * Retourne { error: string | null }
 */
export async function updateUserRole(
  userId: string,
  role: AppRole
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role }, { onConflict: "user_id" });
  if (error) {
    console.error("Erreur lors de la mise à jour du rôle :", error.message);
    return { error: error.message };
  }
  return { error: null };
}

