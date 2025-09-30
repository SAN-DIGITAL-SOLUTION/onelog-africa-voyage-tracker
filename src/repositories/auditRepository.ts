/**
 * Audit Repository
 * Couche d'accès aux données pour la table audit_logs
 * 
 * Ce repository gère les interactions directes avec la base de données
 * pour les logs d'audit, en utilisant le service role Supabase si nécessaire.
 */

import { supabase } from '@/integrations/supabase/client';
import type { AuditLog, AuditEntity, AuditAction } from '@/services/auditService';

/**
 * Interface pour créer un audit log
 */
export interface CreateAuditLogInput {
  actor_id: string;
  actor_role?: string;
  actor_email?: string;
  entity: AuditEntity;
  entity_id?: string;
  action: AuditAction;
  context?: Record<string, any>;
  duration_ms?: number;
  success?: boolean;
  error_message?: string;
}

/**
 * Interface pour les filtres de recherche
 */
export interface AuditLogFilters {
  actor_id?: string;
  entity?: AuditEntity;
  entity_id?: string;
  action?: AuditAction;
  start_date?: string;
  end_date?: string;
  success?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * Repository pour la table audit_logs
 */
class AuditRepository {
  /**
   * Insérer un nouveau log d'audit
   * 
   * @param input - Données du log à insérer
   * @returns Log créé avec son ID
   */
  async insert(input: CreateAuditLogInput): Promise<AuditLog> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        actor_id: input.actor_id,
        actor_role: input.actor_role,
        actor_email: input.actor_email,
        entity: input.entity,
        entity_id: input.entity_id,
        action: input.action,
        context: input.context || {},
        duration_ms: input.duration_ms,
        success: input.success ?? true,
        error_message: input.error_message
      })
      .select()
      .single();

    if (error) {
      console.error('[AuditRepository] Erreur insertion:', error);
      throw new Error(`Erreur lors de l'insertion du log d'audit: ${error.message}`);
    }

    return data as AuditLog;
  }

  /**
   * Insérer plusieurs logs en batch
   * 
   * @param inputs - Liste des logs à insérer
   * @returns Logs créés
   */
  async insertBatch(inputs: CreateAuditLogInput[]): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .insert(inputs.map(input => ({
        actor_id: input.actor_id,
        actor_role: input.actor_role,
        actor_email: input.actor_email,
        entity: input.entity,
        entity_id: input.entity_id,
        action: input.action,
        context: input.context || {},
        duration_ms: input.duration_ms,
        success: input.success ?? true,
        error_message: input.error_message
      })))
      .select();

    if (error) {
      console.error('[AuditRepository] Erreur insertion batch:', error);
      throw new Error(`Erreur lors de l'insertion batch: ${error.message}`);
    }

    return data as AuditLog[];
  }

  /**
   * Rechercher des logs d'audit avec filtres
   * 
   * @param filters - Filtres de recherche
   * @returns Liste des logs correspondants
   */
  async findMany(filters?: AuditLogFilters): Promise<AuditLog[]> {
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.actor_id) {
      query = query.eq('actor_id', filters.actor_id);
    }

    if (filters?.entity) {
      query = query.eq('entity', filters.entity);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AuditRepository] Erreur recherche:', error);
      throw new Error(`Erreur lors de la recherche des logs: ${error.message}`);
    }

    return data as AuditLog[];
  }

  /**
   * Trouver un log par ID
   * 
   * @param id - ID du log
   * @returns Log trouvé ou null
   */
  async findById(id: string): Promise<AuditLog | null> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      console.error('[AuditRepository] Erreur findById:', error);
      throw new Error(`Erreur lors de la recherche du log: ${error.message}`);
    }

    return data as AuditLog;
  }

  /**
   * Récupérer les logs pour une entité spécifique
   * 
   * @param entity - Type d'entité
   * @param entityId - ID de l'entité
   * @param limit - Nombre max de résultats
   * @returns Liste des logs
   */
  async findByEntity(
    entity: AuditEntity,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.findMany({ entity, entity_id: entityId, limit });
  }

  /**
   * Récupérer les logs pour un acteur
   * 
   * @param actorId - ID de l'acteur
   * @param limit - Nombre max de résultats
   * @returns Liste des logs
   */
  async findByActor(
    actorId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.findMany({ actor_id: actorId, limit });
  }

  /**
   * Récupérer les logs échoués
   * 
   * @param limit - Nombre max de résultats
   * @returns Liste des logs en échec
   */
  async findFailedLogs(limit: number = 100): Promise<AuditLog[]> {
    return this.findMany({ success: false, limit });
  }

  /**
   * Compter les logs avec filtres
   * 
   * @param filters - Filtres
   * @returns Nombre de logs
   */
  async count(filters?: Omit<AuditLogFilters, 'limit' | 'offset'>): Promise<number> {
    let query = supabase
      .from('audit_logs')
      .select('*', { count: 'exact', head: true });

    if (filters?.actor_id) {
      query = query.eq('actor_id', filters.actor_id);
    }

    if (filters?.entity) {
      query = query.eq('entity', filters.entity);
    }

    if (filters?.entity_id) {
      query = query.eq('entity_id', filters.entity_id);
    }

    if (filters?.action) {
      query = query.eq('action', filters.action);
    }

    if (filters?.success !== undefined) {
      query = query.eq('success', filters.success);
    }

    if (filters?.start_date) {
      query = query.gte('created_at', filters.start_date);
    }

    if (filters?.end_date) {
      query = query.lte('created_at', filters.end_date);
    }

    const { count, error } = await query;

    if (error) {
      console.error('[AuditRepository] Erreur count:', error);
      throw new Error(`Erreur lors du comptage des logs: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Statistiques sur les actions
   * 
   * @param startDate - Date de début
   * @param endDate - Date de fin
   * @returns Statistiques par action
   */
  async getActionStats(
    startDate?: string,
    endDate?: string
  ): Promise<Record<string, number>> {
    let query = supabase
      .from('audit_logs')
      .select('action');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[AuditRepository] Erreur stats:', error);
      throw new Error(`Erreur lors du calcul des stats: ${error.message}`);
    }

    // Compter les occurrences par action
    const stats: Record<string, number> = {};
    data?.forEach((log) => {
      const action = log.action;
      stats[action] = (stats[action] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton
export const auditRepository = new AuditRepository();
export default auditRepository;
