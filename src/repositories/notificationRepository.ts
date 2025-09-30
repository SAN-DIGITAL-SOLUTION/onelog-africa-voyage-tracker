/**
 * Notification Repository
 * 
 * Couche de persistance pour les notifications
 * Gère l'accès aux données notifications
 * 
 * Pattern: Repository Pattern
 * Responsabilité: CRUD operations sur la table notifications
 */

import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationFilters, NotificationStatus } from '@/types/notifications';

/**
 * Données pour création notification
 */
export interface CreateNotificationData {
  title: string;
  message: string;
  type: string;
  priority: string;
  channel: string;
  user_id?: string;
  billing_partner_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  status: NotificationStatus;
  scheduled_at: string;
  retry_count: number;
}

/**
 * Interface du repository Notification
 */
export interface INotificationRepository {
  findByUserId(userId: string, filters?: NotificationFilters): Promise<Notification[]>;
  getUnreadCount(userId: string): Promise<number>;
  create(notification: CreateNotificationData): Promise<Notification>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<number>;
}

/**
 * Implémentation du repository Notification
 */
export class NotificationRepository implements INotificationRepository {
  /**
   * Récupère les notifications d'un utilisateur
   * @param userId - UUID de l'utilisateur
   * @param filters - Filtres optionnels
   * @returns Liste des notifications
   */
  async findByUserId(userId: string, filters: NotificationFilters = {}): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.type) {
      query = query.eq('type', filters.type);
    }
    if (filters.unreadOnly) {
      query = query.eq('status', 'pending');
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des notifications: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Compte les notifications non lues d'un utilisateur
   * @param userId - UUID de l'utilisateur
   * @returns Nombre de notifications non lues
   */
  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Erreur lors du comptage des notifications non lues: ${error.message}`);
    }

    return count || 0;
  }

  /**
   * Crée une nouvelle notification
   * @param notification - Données de la notification
   * @returns Notification créée
   */
  async create(notification: CreateNotificationData): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la notification: ${error.message}`);
    }

    return data;
  }

  /**
   * Marque une notification comme lue
   * @param id - UUID de la notification
   */
  async markAsRead(id: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read', 
        read_at: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors du marquage comme lu: ${error.message}`);
    }
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param userId - UUID de l'utilisateur
   * @returns Nombre de notifications marquées comme lues
   */
  async markAllAsRead(userId: string): Promise<number> {
    // Compter d'abord les notifications à marquer
    const { count: beforeCount, error: countError } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (countError) {
      throw new Error(`Erreur lors du comptage des notifications: ${countError.message}`);
    }

    const notificationsCount = beforeCount || 0;

    // Si aucune notification à marquer, retourner 0
    if (notificationsCount === 0) {
      return 0;
    }

    // Marquer toutes les notifications comme lues
    const { error } = await supabase
      .from('notifications')
      .update({ 
        status: 'read', 
        read_at: new Date().toISOString() 
      })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      throw new Error(`Erreur lors du marquage de toutes les notifications comme lues: ${error.message}`);
    }

    return notificationsCount;
  }
}

/**
 * Instance singleton du repository
 * Export pour utilisation dans les services
 */
export const notificationRepository = new NotificationRepository();
