import React, { useState } from 'react';
import { X, Bell, Check, Settings, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [filters, setFilters] = useState({
    unreadOnly: false,
    type: 'all',
  });

  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch,
  } = useNotifications({
    unreadOnly: filters.unreadOnly,
    limit: 50,
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'invoice_generated':
        return '📄';
      case 'invoice_sent':
        return '✉️';
      case 'payment_received':
        return '💰';
      case 'mission_completed':
        return '✅';
      case 'system_error':
        return '⚠️';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'warning';
      case 'medium':
        return 'secondary';
      default:
        return 'default';
    }
  };

  return (
    <div
      className={cn(
        'fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out z-50',
        isOpen ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-gray-600" />
            <h2 className="text-lg font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              disabled={unreadCount === 0}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b space-y-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium">Filtres :</label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="all">Tous types</option>
              <option value="invoice">Factures</option>
              <option value="payment">Paiements</option>
              <option value="mission">Missions</option>
            </select>
          </div>
          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={filters.unreadOnly}
              onChange={(e) => setFilters({ ...filters, unreadOnly: e.target.checked })}
              className="rounded"
            />
            <span>Non lues uniquement</span>
          </label>
        </div>

        {/* Notifications list */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Aucune notification</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-3 rounded-lg border transition-colors',
                    !notification.read_at ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200',
                    'hover:bg-gray-100 cursor-pointer'
                  )}
                  onClick={() => markAsRead({ notificationId: notification.id })}
                >
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        <Badge variant={getNotificationColor(notification.priority) as any} className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              // TODO: Navigate to notification preferences
              console.log('Open notification settings');
            }}
          >
            <Settings className="h-4 w-4 mr-2" />
            Préférences de notification
          </Button>
        </div>
      </div>
    </div>
  );
}
