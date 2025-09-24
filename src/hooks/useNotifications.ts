import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationService } from '@/services/notificationService';
import { useAuth } from '@/hooks/useAuth';
import type { Notification, NotificationFilters, NotificationType } from '@/types/notifications';

const notificationService = NotificationService.getInstance();

export function useNotifications(filters: NotificationFilters = {}) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const userId = user?.id;

  const {
    data: notifications = [],
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', userId, filters],
    queryFn: () => {
      if (!userId) return Promise.resolve([]);
      return notificationService.getUserNotifications(userId, filters);
    },
    enabled: !!userId,
    staleTime: 1000 * 60,
  });

  const {
    data: unreadCount = 0,
    refetch: refetchUnreadCount
  } = useQuery({
    queryKey: ['notifications', userId, 'unread'],
    queryFn: () => {
      if (!userId) return Promise.resolve(0);
      return notificationService.getUnreadCount(userId);
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  const {
    data: preferences,
    refetch: refetchPreferences
  } = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(null);
      return notificationService.getUserPreferences(userId);
    },
    enabled: !!userId,
  });

  const markAsReadMutation = useMutation({
    mutationFn: ({ notificationId }: { notificationId: string }) => {
      if (!userId) throw new Error('User not authenticated');
      return notificationService.markAsRead(notificationId, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId, 'unread'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => {
      if (!userId) throw new Error('User not authenticated');
      return notificationService.markAllAsRead(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
      queryClient.invalidateQueries({ queryKey: ['notifications', userId, 'unread'] });
    },
  });

  const createNotificationMutation = useMutation({
    mutationFn: (params: {
      title: string;
      message: string;
      type: NotificationType;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      userId?: string;
      billingPartnerId?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      metadata?: any;
      channels?: ('email' | 'slack' | 'in_app' | 'sms')[];
    }) => {
      return notificationService.createNotification(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  return {
    notifications,
    unreadCount,
    preferences,
    isLoading,
    isError,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    createNotification: createNotificationMutation.mutate,
  };
}

export function useNotificationBadge() {
  const { user } = useAuth();
  const userId = user?.id;

  const {
    data: unreadCount = 0,
  } = useQuery({
    queryKey: ['notifications', userId, 'unread'],
    queryFn: () => {
      if (!userId) return Promise.resolve(0);
      return notificationService.getUnreadCount(userId);
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  return { unreadCount };
}

export function useNotificationPreferences() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const {
    data: preferences,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['notification-preferences', userId],
    queryFn: () => {
      if (!userId) return Promise.resolve(null);
      return notificationService.getUserPreferences(userId);
    },
    enabled: !!userId,
  });

  const updatePreferences = useMutation({
    mutationFn: (preferences: any) => {
      if (!userId) throw new Error('User not authenticated');
      return notificationService.updateUserPreferences(userId, preferences);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', userId] });
    },
  });

  return {
    preferences,
    isLoading,
    refetch,
    updatePreferences: updatePreferences.mutate,
  };
}

export function useCreateNotification() {
  const queryClient = useQueryClient();

  const createNotification = useMutation({
    mutationFn: (params: {
      title: string;
      message: string;
      type: NotificationType;
      priority?: 'low' | 'medium' | 'high' | 'critical';
      userId?: string;
      billingPartnerId?: string;
      relatedEntityType?: string;
      relatedEntityId?: string;
      metadata?: any;
      channels?: ('email' | 'slack' | 'in_app' | 'sms')[];
    }) => {
      return notificationService.createNotification(params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread'] });
    },
  });

  return {
    createNotification: createNotification.mutate,
    isCreating: createNotification.isPending,
  };
}
