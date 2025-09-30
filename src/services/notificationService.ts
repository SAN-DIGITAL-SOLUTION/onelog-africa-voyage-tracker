import { supabase } from '@/integrations/supabase/client';
import type { Notification, NotificationFilters, CreateNotificationParams } from '@/types/notifications';
import { auditService } from '@/services/auditService';
import { notificationRepository } from '@/repositories/notificationRepository';
import type { CreateNotificationData } from '@/repositories/notificationRepository';

export class NotificationService {
  private static instance: NotificationService;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async getUserNotifications(userId: string, filters: NotificationFilters = {}): Promise<Notification[]> {
    return await notificationRepository.findByUserId(userId, filters);
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await notificationRepository.getUnreadCount(userId);
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
    await notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string, actorId?: string): Promise<void> {
    const count = await notificationRepository.markAllAsRead(userId);

    // Audit trail: Log bulk mark as read
    if (actorId && count > 0) {
      await auditService.logUpdate(
        actorId,
        'notification',
        userId, // Using userId as entity_id for bulk operations
        { 
          action: 'mark_all_as_read',
          count: count
        }
      );
    }
  }

  async createNotification(params: CreateNotificationParams, actorId?: string): Promise<Notification> {
    const notificationData: CreateNotificationData = {
      title: params.title,
      message: params.message,
      type: params.type,
      priority: params.priority || 'medium',
      channel: 'in_app',
      user_id: params.userId,
      billing_partner_id: params.billingPartnerId,
      related_entity_type: params.relatedEntityType,
      related_entity_id: params.relatedEntityId,
      metadata: params.metadata,
      status: 'pending',
      scheduled_at: new Date().toISOString(),
      retry_count: 0
    };

    const notification = await notificationRepository.create(notificationData);

    // Audit trail: Log manual notification creation
    if (actorId) {
      await auditService.logCreate(
        actorId,
        'notification',
        notification.id,
        { 
          type: params.type,
          priority: params.priority || 'medium',
          recipient: params.userId,
          title: params.title
        }
      );
    }

    return notification;
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

