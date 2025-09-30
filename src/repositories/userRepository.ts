/**
 * User Repository
 * 
 * Couche de persistance pour les utilisateurs
 * Gère l'accès aux données users + auth metadata Supabase
 * 
 * Pattern: Repository Pattern
 * Responsabilité: CRUD operations sur la table users + auth.users
 */

import { supabase } from '@/integrations/supabase/client';
import type { UserProfile, UserRole } from '@/types/user';
import type { Repository } from './types';

/**
 * Filtres pour la recherche d'utilisateurs
 */
export interface UserFilters {
  role?: UserRole;
  email?: string;
  name?: string;
  created_after?: string;
  created_before?: string;
}

/**
 * Données pour création utilisateur
 */
export interface CreateUserData {
  id: string; // UUID from auth.users
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Métadonnées auth Supabase
 */
export interface UserMetadata {
  name?: string;
  role?: UserRole;
  [key: string]: unknown;
}

/**
 * Interface du repository User
 * Étend Repository générique avec méthodes spécifiques
 */
export interface IUserRepository extends Repository<UserProfile, UserFilters> {
  findByEmail(email: string): Promise<UserProfile | null>;
  updateAuthMetadata(userId: string, metadata: UserMetadata): Promise<void>;
}

/**
 * Implémentation du repository User
 */
export class UserRepository implements IUserRepository {
  /**
   * Récupère un utilisateur par son ID
   * @param id - UUID de l'utilisateur
   * @returns UserProfile ou null si non trouvé
   */
  async findById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Erreur lors de la récupération de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupère un utilisateur par son email
   * Méthode spécifique au domaine User
   * @param email - Email de l'utilisateur
   * @returns UserProfile ou null si non trouvé
   */
  async findByEmail(email: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Erreur lors de la récupération de l'utilisateur par email: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupère tous les utilisateurs avec filtres optionnels
   * @param filters - Filtres de recherche
   * @returns Liste des utilisateurs
   */
  async findAll(filters?: UserFilters): Promise<UserProfile[]> {
    let query = supabase
      .from('users')
      .select('id, name, email, role, created_at')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters) {
      if (filters.role) {
        query = query.eq('role', filters.role);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }
      if (filters.name) {
        query = query.ilike('name', `%${filters.name}%`);
      }
      if (filters.created_after) {
        query = query.gte('created_at', filters.created_after);
      }
      if (filters.created_before) {
        query = query.lte('created_at', filters.created_before);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des utilisateurs: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crée un nouvel utilisateur
   * Note: L'ID doit provenir de auth.users (créé par Supabase Auth)
   * @param user - Données de l'utilisateur
   * @returns UserProfile créé
   */
  async create(user: CreateUserData): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }])
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  /**
   * Met à jour un utilisateur existant
   * @param id - UUID de l'utilisateur
   * @param user - Données partielles à mettre à jour
   * @returns UserProfile mis à jour
   */
  async update(id: string, user: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('users')
      .update({
        ...(user.name && { name: user.name }),
        ...(user.role && { role: user.role }),
        ...(user.email && { email: user.email })
      })
      .eq('id', id)
      .select('id, name, email, role, created_at')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`);
    }

    return data;
  }

  /**
   * Supprime un utilisateur
   * Note: Ne supprime pas le compte auth.users, seulement l'entrée users
   * @param id - UUID de l'utilisateur
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de l'utilisateur: ${error.message}`);
    }
  }

  /**
   * Met à jour les métadonnées auth Supabase
   * Méthode spécifique pour synchroniser auth.users
   * @param userId - UUID de l'utilisateur
   * @param metadata - Métadonnées à mettre à jour
   */
  async updateAuthMetadata(userId: string, metadata: UserMetadata): Promise<void> {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: metadata
    });

    if (error) {
      throw new Error(`Erreur lors de la mise à jour des métadonnées auth: ${error.message}`);
    }
  }
}

/**
 * Instance singleton du repository
 * Export pour utilisation dans les services
 */
export const userRepository = new UserRepository();
