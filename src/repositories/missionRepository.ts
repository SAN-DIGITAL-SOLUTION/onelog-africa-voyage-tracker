/**
 * Mission Repository
 * 
 * Couche de persistance pour les missions
 * Sépare la logique métier (services) de l'accès aux données
 * 
 * Pattern: Repository Pattern
 * Responsabilité: CRUD operations sur la table missions
 */

import { supabase } from '@/integrations/supabase/client';
import type { Mission, MissionStatus } from '@/types/mission';
import type { Repository } from './types';

/**
 * Filtres pour la recherche de missions
 */
export interface MissionFilters {
  status?: MissionStatus;
  client?: string;
  chauffeur?: string;
  user_id?: string;
  start_date_from?: string;
  start_date_to?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Interface du repository Mission
 * Étend Repository générique avec méthode spécifique changeStatus
 */
export interface IMissionRepository extends Repository<Mission, MissionFilters> {
  changeStatus(id: string, status: MissionStatus): Promise<Mission>;
}

/**
 * Implémentation du repository Mission
 */
export class MissionRepository implements IMissionRepository {
  /**
   * Récupère une mission par son ID
   * @param id - UUID de la mission
   * @returns Mission ou null si non trouvée
   */
  async findById(id: string): Promise<Mission | null> {
    const { data, error } = await supabase
      .from('missions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Erreur lors de la récupération de la mission: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupère toutes les missions avec filtres optionnels
   * @param filters - Filtres de recherche
   * @returns Liste des missions
   */
  async findAll(filters?: MissionFilters): Promise<Mission[]> {
    let query = supabase
      .from('missions')
      .select('*')
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.client) {
        query = query.eq('client', filters.client);
      }
      if (filters.chauffeur) {
        query = query.eq('chauffeur', filters.chauffeur);
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.start_date_from) {
        query = query.gte('start_date', filters.start_date_from);
      }
      if (filters.start_date_to) {
        query = query.lte('start_date', filters.start_date_to);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des missions: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crée une nouvelle mission
   * @param mission - Données de la mission (sans id)
   * @returns Mission créée avec son ID
   */
  async create(mission: Omit<Mission, 'id'>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .insert([mission])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la mission: ${error.message}`);
    }

    return data;
  }

  /**
   * Met à jour une mission existante
   * @param id - UUID de la mission
   * @param mission - Données partielles à mettre à jour
   * @returns Mission mise à jour
   */
  async update(id: string, mission: Partial<Mission>): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update(mission)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la mission: ${error.message}`);
    }

    return data;
  }

  /**
   * Supprime une mission
   * @param id - UUID de la mission
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('missions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la mission: ${error.message}`);
    }
  }

  /**
   * Change le statut d'une mission
   * Méthode spécifique au domaine Mission
   * @param id - UUID de la mission
   * @param status - Nouveau statut
   * @returns Mission mise à jour
   */
  async changeStatus(id: string, status: MissionStatus): Promise<Mission> {
    const { data, error } = await supabase
      .from('missions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors du changement de statut de la mission: ${error.message}`);
    }

    return data;
  }
}

/**
 * Instance singleton du repository
 * Export pour utilisation dans les services
 */
export const missionRepository = new MissionRepository();
