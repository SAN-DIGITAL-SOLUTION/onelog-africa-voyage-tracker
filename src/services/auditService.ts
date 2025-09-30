/**
 * Audit Service
 * Service de traçabilité pour conformité GDPR et audit trail
 * 
 * Ce service permet de logger toutes les actions sensibles effectuées dans l'application
 * pour assurer la conformité GDPR et faciliter les audits de sécurité.
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Type des entités auditables
 */
export type AuditEntity = 
  | 'mission'
  | 'user'
  | 'invoice'
  | 'notification'
  | 'role'
  | 'document'
  | 'payment'
  | 'tracking_point'
  | 'system';

/**
 * Type des actions auditables
 */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'view'
  | 'export'
  | 'send'
  | 'approve'
  | 'reject'
  | 'assign'
  | 'unassign'
  | 'login'
  | 'logout'
  | 'access_denied';

/**
 * Interface pour un log d'audit
 */
export interface AuditLog {
  id?: string;
  created_at?: string;
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
 * Options pour logger une action
 */
export interface LogActionOptions {
  actorId: string;
  actorRole?: string;
  entity: AuditEntity;
  entityId?: string;
  action: AuditAction;
  context?: Record<string, any>;
  success?: boolean;
  errorMessage?: string;
  durationMs?: number;
}

/**
 * Service d'audit
 */
class AuditService {
  /**
   * Logger une action dans la table audit_logs
   * 
   * @param options - Options de logging
   * @returns ID du log créé ou null en cas d'erreur
   */
  async logAction(options: LogActionOptions): Promise<string | null> {
    try {
      const {
        actorId,
        actorRole,
        entity,
        entityId,
        action,
        context = {},
        success = true,
        errorMessage,
        durationMs
      } = options;

      // Enrichir le contexte avec des métadonnées utiles
      const enrichedContext = {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        // Note: IP address devrait être ajoutée côté backend/Edge Function
      };

      // Appeler la fonction RPC Supabase pour logger
      const { data, error } = await supabase.rpc('log_audit_action', {
        p_actor_id: actorId,
        p_actor_role: actorRole,
        p_entity: entity,
        p_entity_id: entityId,
        p_action: action,
        p_context: enrichedContext,
        p_success: success,
        p_error_message: errorMessage
      });

      if (error) {
        console.error('[AuditService] Erreur lors du logging:', error);
        // Ne pas throw pour ne pas bloquer l'action principale
        return null;
      }

      return data as string;
    } catch (err) {
      console.error('[AuditService] Exception lors du logging:', err);
      return null;
    }
  }

  /**
   * Logger une création d'entité
   */
  async logCreate(
    actorId: string,
    entity: AuditEntity,
    entityId: string,
    context?: Record<string, any>
  ): Promise<string | null> {
    return this.logAction({
      actorId,
      entity,
      entityId,
      action: 'create',
      context
    });
  }

  /**
   * Logger une modification d'entité
   */
  async logUpdate(
    actorId: string,
    entity: AuditEntity,
    entityId: string,
    context?: Record<string, any>
  ): Promise<string | null> {
    return this.logAction({
      actorId,
      entity,
      entityId,
      action: 'update',
      context
    });
  }

  /**
   * Logger une suppression d'entité
   */
  async logDelete(
    actorId: string,
    entity: AuditEntity,
    entityId: string,
    context?: Record<string, any>
  ): Promise<string | null> {
    return this.logAction({
      actorId,
      entity,
      entityId,
      action: 'delete',
      context
    });
  }

  /**
   * Logger un export de données
   */
  async logExport(
    actorId: string,
    entity: AuditEntity,
    context?: Record<string, any>
  ): Promise<string | null> {
    return this.logAction({
      actorId,
      entity,
      action: 'export',
      context
    });
  }

  /**
   * Logger un accès refusé
   */
  async logAccessDenied(
    actorId: string,
    entity: AuditEntity,
    entityId?: string,
    context?: Record<string, any>
  ): Promise<string | null> {
    return this.logAction({
      actorId,
      entity,
      entityId,
      action: 'access_denied',
      success: false,
      context
    });
  }

  /**
   * Récupérer les logs d'audit (admin uniquement)
   * 
   * @param filters - Filtres optionnels
   * @returns Liste des logs
   */
  async getLogs(filters?: {
    actorId?: string;
    entity?: AuditEntity;
    entityId?: string;
    action?: AuditAction;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<AuditLog[]> {
    try {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.actorId) {
        query = query.eq('actor_id', filters.actorId);
      }

      if (filters?.entity) {
        query = query.eq('entity', filters.entity);
      }

      if (filters?.entityId) {
        query = query.eq('entity_id', filters.entityId);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
      }

      if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
      }

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[AuditService] Erreur lors de la récupération des logs:', error);
        throw error;
      }

      return data as AuditLog[];
    } catch (err) {
      console.error('[AuditService] Exception lors de la récupération des logs:', err);
      throw err;
    }
  }

  /**
   * Récupérer les logs pour une entité spécifique
   */
  async getLogsForEntity(
    entity: AuditEntity,
    entityId: string,
    limit: number = 50
  ): Promise<AuditLog[]> {
    return this.getLogs({ entity, entityId, limit });
  }

  /**
   * Récupérer les logs pour un utilisateur
   */
  async getLogsForUser(
    actorId: string,
    limit: number = 100
  ): Promise<AuditLog[]> {
    return this.getLogs({ actorId, limit });
  }

  /**
   * Wrapper avec mesure de performance
   * 
   * Permet de wrapper une fonction et logger automatiquement son exécution
   */
  async withAudit<T>(
    actorId: string,
    entity: AuditEntity,
    action: AuditAction,
    fn: () => Promise<T>,
    context?: Record<string, any>
  ): Promise<T> {
    const startTime = Date.now();
    let success = true;
    let errorMessage: string | undefined;
    let entityId: string | undefined;

    try {
      const result = await fn();
      
      // Si le résultat contient un ID, l'utiliser comme entity_id
      if (result && typeof result === 'object' && 'id' in result) {
        entityId = (result as any).id;
      }

      return result;
    } catch (error) {
      success = false;
      errorMessage = error instanceof Error ? error.message : String(error);
      throw error;
    } finally {
      const durationMs = Date.now() - startTime;
      
      // Logger l'action en arrière-plan
      this.logAction({
        actorId,
        entity,
        entityId,
        action,
        context,
        success,
        errorMessage,
        durationMs
      }).catch(err => {
        console.error('[AuditService] Erreur lors du logging final:', err);
      });
    }
  }
}

// Export singleton
export const auditService = new AuditService();
export default auditService;
