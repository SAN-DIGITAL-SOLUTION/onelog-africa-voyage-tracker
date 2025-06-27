import { UserRole, Permission } from './types';
import { supabase } from '../supabaseClient';

// Mappage des rôles aux permissions
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.CREATE_USERS,
    Permission.EDIT_USERS,
    Permission.DELETE_USERS,
    Permission.VIEW_MISSIONS,
    Permission.CREATE_MISSIONS,
    Permission.EDIT_MISSIONS,
    Permission.DELETE_MISSIONS,
    Permission.VIEW_VEHICLES,
    Permission.CREATE_VEHICLES,
    Permission.EDIT_VEHICLES,
    Permission.DELETE_VEHICLES,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
    Permission.MANAGE_SETTINGS,
  ],
  [UserRole.MANAGER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_USERS,
    Permission.VIEW_MISSIONS,
    Permission.CREATE_MISSIONS,
    Permission.EDIT_MISSIONS,
    Permission.VIEW_VEHICLES,
    Permission.VIEW_REPORTS,
    Permission.GENERATE_REPORTS,
  ],
  [UserRole.DRIVER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MISSIONS,
    Permission.EDIT_MISSIONS,
  ],
  [UserRole.CUSTOMER]: [
    Permission.VIEW_DASHBOARD,
    Permission.VIEW_MISSIONS,
  ],
  [UserRole.GUEST]: [],
};

/**
 * Vérifie si un utilisateur a un rôle spécifique
 */
export const hasRole = async (role: UserRole, userId?: string): Promise<boolean> => {
  if (!userId) return false;
  
  // Récupérer le profil utilisateur
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) return false;
  
  return profile.role === role;
};

/**
 * Vérifie si un utilisateur a l'un des rôles spécifiés
 */
export const hasAnyRole = async (roles: UserRole[], userId?: string): Promise<boolean> => {
  if (!userId || !roles.length) return false;
  
  // Récupérer le profil utilisateur
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) return false;
  
  return roles.includes(profile.role as UserRole);
};

/**
 * Vérifie si un utilisateur a une permission spécifique
 */
export const hasPermission = async (permission: Permission, userId?: string): Promise<boolean> => {
  if (!userId) return false;
  
  // Récupérer le profil utilisateur avec les rôles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) return false;
  
  // Vérifier si le rôle de l'utilisateur a la permission
  const userRole = profile.role as UserRole;
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

/**
 * Vérifie si un utilisateur a l'une des permissions spécifiées
 */
export const hasAnyPermission = async (permissions: Permission[], userId?: string): Promise<boolean> => {
  if (!userId || !permissions.length) return false;
  
  // Récupérer le profil utilisateur avec les rôles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) return false;
  
  // Vérifier si le rôle de l'utilisateur a l'une des permissions
  const userRole = profile.role as UserRole;
  const userPermissions = ROLE_PERMISSIONS[userRole] || [];
  
  return permissions.some(permission => 
    userPermissions.includes(permission)
  );
};

/**
 * Récupère toutes les permissions d'un utilisateur
 */
export const getUserPermissions = async (userId?: string): Promise<Permission[]> => {
  if (!userId) return [];
  
  // Récupérer le profil utilisateur avec les rôles
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (error || !profile) return [];
  
  // Retourner les permissions du rôle de l'utilisateur
  const userRole = profile.role as UserRole;
  return ROLE_PERMISSIONS[userRole] || [];
};
