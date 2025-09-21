
import { supabase } from '@/lib/supabase';
import type { AppRole } from "./useRole";

// Fonctions RPC supprimées car inexistantes dans Supabase

/**
 * Retourne le rôle trouvé, ou null si aucun rôle pour l'utilisateur
 */
export async function fetchUserRole(userId: string): Promise<AppRole> {
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, role_status")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération du rôle:", error.message);
      return null;
    }

    if (!data || !data.role) {
      return null;
    }
    
    return data.role as AppRole;
  } catch (error) {
    console.error("Erreur inattendue lors de la récupération du rôle:", error);
    return null;
  }
}

/**
 * Crée ou met à jour le rôle d'un utilisateur dans la table user_roles.
 * Retourne { error: string | null }
 */
export async function updateUserRole(
  userId: string,
  role: AppRole
): Promise<{ error: string | null }> {
  try {
    const { error } = await supabase
      .from("user_roles")
      .upsert({ user_id: userId, role, role_status: 'approved' }, { onConflict: "user_id" });
      
    if (error) {
      console.error("Erreur lors de la mise à jour du rôle:", error.message);
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error) {
    console.error("Erreur inattendue lors de la mise à jour du rôle:", error);
    return { error: "Une erreur inattendue s'est produite lors de la mise à jour du rôle" };
  }
}

