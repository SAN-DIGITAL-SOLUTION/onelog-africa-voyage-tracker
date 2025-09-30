import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationFilters, CreateNotificationParams } from '@/types/notifications';

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getUserNotifications(userId: string, filters: NotificationFilters = {}): Promise<Notification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(filters.limit || 50);

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return [];
    }

    return data || [];
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
      return 0;
    }

    return count || 0;
  }

  async getUserPreferences(userId: string): Promise<any> {
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      return null;
    }

    return data;
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('id', notificationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du marquage comme lu:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read', read_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  }

  async createNotification(params: CreateNotificationParams): Promise<Notification> {
    const { data, error } = await supabase
      .from('notifications')
      .insert([{
        title: params.title,
        message: params.message,
        type: params.type,
        priority: params.priority || 'medium',
        user_id: params.userId,
        billing_partner_id: params.billingPartnerId,
        related_entity_type: params.relatedEntityType,
        related_entity_id: params.relatedEntityId,
        metadata: params.metadata,
        status: 'pending',
        channel: 'in_app',
        scheduled_at: new Date().toISOString(),
        retry_count: 0
      }])
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de la création de la notification:', error);
      throw error;
    }

    return data;
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      throw error;
    }
  }
}

