export type NotificationType = 
  | 'invoice_generated'
  | 'invoice_validated'
  | 'invoice_sent'
  | 'payment_received'
  | 'payment_overdue'
  | 'mission_completed'
  | 'billing_partner_updated'
  | 'system_error';

export type NotificationChannel = 'email' | 'slack' | 'in_app' | 'sms';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'read' | 'dismissed';
export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  user_id?: string;
  billing_partner_id?: string;
  related_entity_type?: string;
  related_entity_id?: string;
  metadata?: any;
  status: NotificationStatus;
  scheduled_at: string;
  sent_at?: string;
  read_at?: string;
  failed_reason?: string;
  retry_count: number;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreference {
  id: string;
  user_id: string;
  email_enabled: boolean;
  slack_enabled: boolean;
  in_app_enabled: boolean;
  sms_enabled: boolean;
  preferences: Record<NotificationType, NotificationChannel[]>;
  quiet_hours: {
    start: string;
    end: string;
  };
  created_at: string;
  updated_at: string;
}

export interface CreateNotificationParams {
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  userId?: string;
  billingPartnerId?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  metadata?: any;
  channels?: NotificationChannel[];
}

export interface NotificationFilters {
  limit?: number;
  offset?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  unreadOnly?: boolean;
}
