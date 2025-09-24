import { supabase } from './client';
import type { UserRole, UserProfile as IUserProfile } from './types';
import { Permission, ROLE_PERMISSIONS } from './types';

/**
 * Interface pour le profil utilisateur dans la base de données
 * @extends IUserProfile
 */
export interface Profile extends IUserProfile {
  id: string;
  role: UserRole;
  email?: string;
  full_name?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_login?: string;
  phone?: string;
  company?: string;
  metadata?: Record<string, any>;
}

// Type pour la réponse de la requête de profil
type ProfileResponse = {
  data: Profile | null;
  error: any;
};

/**
 * Récupère le profil utilisateur complet
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 */
export const getProfile = async (userId?: string): Promise<Profile | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  const targetUserId = userId || user?.id;
  
  if (!targetUserId) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single<Profile>();

  if (error || !profile) return null;
  return profile;
};

/**
 * Vérifie si l'utilisateur actuel a un rôle spécifique
 * @param role Le rôle à vérifier
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a le rôle, false sinon
 */
export const hasRole = async (role: UserRole, userId?: string): Promise<boolean> => {
  const profile = await getProfile(userId);
  return profile?.role === role;
};

/**
 * Vérifie si l'utilisateur a l'un des rôles spécifiés
 * @param roles Les rôles à vérifier
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a l'un des rôles, false sinon
 */
export const hasAnyRole = async (roles: UserRole[], userId?: string): Promise<boolean> => {
  const profile = await getProfile(userId);
  return profile?.role ? roles.includes(profile.role) : false;
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 * @param permission La permission à vérifier
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a la permission, false sinon
 */
export const hasPermission = async (permission: Permission, userId?: string): Promise<boolean> => {
  const profile = await getProfile(userId);
  if (!profile) return false;
  
  // Les admins ont toutes les permissions
  if (profile.role === 'admin') return true;
  
  const rolePermissions = ROLE_PERMISSIONS[profile.role] || [];
  
  return rolePermissions.includes(permission);
};

/**
 * Vérifie si l'utilisateur a l'une des permissions spécifiées
 * @param permissions Les permissions à vérifier
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a au moins une des permissions, false sinon
 */
export const hasAnyPermission = async (permissions: Permission[], userId?: string): Promise<boolean> => {
  const profile = await getProfile(userId);
  if (!profile) return false;
  
  // Les admins ont toutes les permissions
  if (profile.role === 'admin') return true;
  
  // Vérifier si le rôle de l'utilisateur a l'une des permissions
  const rolePermissions = ROLE_PERMISSIONS[profile.role] || [];
  
  return permissions.some(permission => rolePermissions.includes(permission));
};

/**
 * Récupère le rôle de l'utilisateur actuel
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<UserRole | null> Le rôle de l'utilisateur ou null si non trouvé
 */
export const getUserRole = async (userId?: string): Promise<UserRole | null> => {
  const profile = await getProfile(userId);
  return profile?.role ?? null;
};

/**
 * Récupère toutes les permissions de l'utilisateur
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<Permission[]> Tableau des permissions de l'utilisateur
 */
export const getUserPermissions = async (userId?: string): Promise<Permission[]> => {
  const profile = await getProfile(userId);
  if (!profile) return [];
  
  // Les admins ont toutes les permissions
  if (profile.role === 'admin') {
    return Object.values(Permission);
  }
  
  return ROLE_PERMISSIONS[profile.role] || [];
};

/**
 * Récupère le profil complet de l'utilisateur actuel
 * @deprecated Utilisez `getProfile()` à la place
 * @returns Promise<Profile | null> Le profil utilisateur ou null si non trouvé
 */
export const getUserProfile = getProfile;

/**
 * Redirige l'utilisateur s'il n'a pas le rôle requis
 * @param requiredRole Le rôle requis
 * @param redirectPath Chemin de redirection si l'utilisateur n'a pas le rôle (par défaut: '/unauthorized')
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a le rôle, false sinon
 */
export const requireRole = async (
  requiredRole: UserRole, 
  redirectPath = '/unauthorized',
  userId?: string
): Promise<boolean> => {
  const hasRequiredRole = await hasRole(requiredRole, userId);
  if (!hasRequiredRole && typeof window !== 'undefined') {
    window.location.href = redirectPath;
    return false;
  }
  return hasRequiredRole;
};

/**
 * Redirige l'utilisateur s'il n'a pas la permission requise
 * @param requiredPermission La permission requise
 * @param redirectPath Chemin de redirection si l'utilisateur n'a pas la permission (par défaut: '/unauthorized')
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a la permission, false sinon
 */
export const requirePermission = async (
  requiredPermission: Permission,
  redirectPath = '/unauthorized',
  userId?: string
): Promise<boolean> => {
  const hasPerm = await hasPermission(requiredPermission, userId);
  if (!hasPerm && typeof window !== 'undefined') {
    window.location.href = redirectPath;
    return false;
  }
  return hasPerm;
};

/**
 * Redirige l'utilisateur s'il n'a aucune des permissions requises
 * @param requiredPermissions Les permissions à vérifier
 * @param redirectPath Chemin de redirection si l'utilisateur n'a aucune permission (par défaut: '/unauthorized')
 * @param userId ID de l'utilisateur (optionnel, utilise l'utilisateur connecté si non fourni)
 * @returns Promise<boolean> True si l'utilisateur a au moins une permission, false sinon
 */
export const requireAnyPermission = async (
  requiredPermissions: Permission[],
  redirectPath = '/unauthorized',
  userId?: string
): Promise<boolean> => {
  const hasAnyPerm = await hasAnyPermission(requiredPermissions, userId);
  if (!hasAnyPerm && typeof window !== 'undefined') {
    window.location.href = redirectPath;
    return false;
  }
  return hasAnyPerm;
};

/**
 * Redirige l'utilisateur s'il n'a aucun des rôles requis
 * @param requiredRoles Les rôles requis
 * @param redirectPath Chemin de redirection si l'utilisateur n'a aucun des rôles
 */
export const requireAnyRole = async (requiredRoles: UserRole[], redirectPath = '/unauthorized'): Promise<boolean> => {
  const hasAnyRequiredRole = await hasAnyRole(requiredRoles);
  if (!hasAnyRequiredRole && typeof window !== 'undefined') {
    window.location.href = redirectPath;
    return false;
  }
  return hasAnyRequiredRole;
};
