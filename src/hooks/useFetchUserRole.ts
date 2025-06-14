
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./useRole";

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
  // Si on veut supporter plusieurs rôles par user, on prend le premier  
  // Sinon adapte à ta logique métier
  return data?.role ?? null;
}
