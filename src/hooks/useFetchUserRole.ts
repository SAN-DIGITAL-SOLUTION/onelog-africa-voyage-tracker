
import { supabase } from "@/integrations/supabase/client";
import type { AppRole } from "./useRole";

/**
 * Vérifie si la table user_roles existe et a la structure attendue
 */
async function checkUserRolesTable(): Promise<boolean> {
  try {
    console.log('[useFetchUserRole] Vérification de l\'existence de la table user_roles...');
    
    // Vérifier si la table existe
    const { data: tableExists, error: tableError } = await supabase
      .rpc('table_exists', { p_table_name: 'user_roles' });
    
    if (tableError) {
      console.error('[useFetchUserRole] Erreur lors de la vérification de la table user_roles:', tableError);
      return false;
    }
    
    if (!tableExists) {
      console.warn('[useFetchUserRole] La table user_roles n\'existe pas');
      return false;
    }
    
    console.log('[useFetchUserRole] La table user_roles existe, vérification des colonnes...');
    
    // Vérifier si la colonne role existe
    const { data: columnExists, error: columnError } = await supabase
      .rpc('column_exists', { 
        p_table_name: 'user_roles', 
        p_column_name: 'role' 
      });
    
    if (columnError) {
      console.error('[useFetchUserRole] Erreur lors de la vérification de la colonne role:', columnError);
      return false;
    }
    
    if (!columnExists) {
      console.warn("[useFetchUserRole] La colonne 'role' n'existe pas dans la table user_roles");
      return false;
    }
    
    console.log('[useFetchUserRole] La table user_roles a la structure attendue');
    return true;
  } catch (error) {
    console.error("Erreur lors de la vérification de la table user_roles:", error);
    return false;
  }
}

/**
 * Crée la table user_roles avec la structure attendue
 */
async function createUserRolesTable(): Promise<boolean> {
  try {
    console.log("Tentative de création de la table user_roles...");
    
    // Créer le type enum app_role s'il n'existe pas
    const { error: enumError } = await supabase.rpc('create_app_role_enum');
    
    if (enumError) {
      console.warn("Impossible de créer le type app_role:", enumError.message);
    }
    
    // Créer la table user_roles
    const { error: createError } = await supabase.rpc('create_user_roles_table');
    
    if (createError) {
      console.error("Erreur lors de la création de la table user_roles:", createError.message);
      return false;
    }
    
    console.log("Table user_roles créée avec succès");
    return true;
  } catch (error) {
    console.error("Erreur lors de la création de la table user_roles:", error);
    return false;
  }
}

/**
 * Retourne le rôle trouvé, ou null si aucun rôle pour l'utilisateur
 */
export async function fetchUserRole(userId: string): Promise<AppRole> {
  console.log(`[useFetchUserRole] Début de la récupération du rôle pour l'utilisateur ${userId}`);
  
  try {
    // Vérifier si la table user_roles existe et est accessible
    console.log('[useFetchUserRole] Vérification de la table user_roles...');
    const tableExists = await checkUserRolesTable();
    
    if (!tableExists) {
      console.warn('[useFetchUserRole] La table user_roles n\'existe pas ou n\'est pas accessible');
      
      // Tentative de création de la table si elle n'existe pas
      console.log('[useFetchUserRole] Tentative de création de la table user_roles...');
      const created = await createUserRolesTable();
      
      if (!created) {
        console.error('[useFetchUserRole] Impossible de créer la table user_roles');
        return null;
      }
      
      console.log('[useFetchUserRole] Table user_roles créée avec succès');
      return null; // L'utilisateur n'a pas encore de rôle
    }
    
    // Essayer de récupérer le rôle de l'utilisateur
    console.log(`[useFetchUserRole] Récupération du rôle pour l'utilisateur ${userId}...`);
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
      // Aucun rôle trouvé pour cet utilisateur
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
    // Vérifier si la table user_roles existe et est accessible
    let tableExists = await checkUserRolesTable();
    
    // Si la table n'existe pas, essayer de la créer
    if (!tableExists) {
      console.log("Tentative de création de la table user_roles...");
      tableExists = await createUserRolesTable();
      
      if (!tableExists) {
        console.error("Impossible de créer la table user_roles");
        return { error: "Impossible de créer la table des rôles utilisateur" };
      }
    }
    
    // Mettre à jour ou insérer le rôle de l'utilisateur
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

