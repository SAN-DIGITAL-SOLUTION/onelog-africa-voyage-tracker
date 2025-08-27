import React from 'react';
import { Bell } from 'lucide-react';
import { useNotificationBadge } from '@/hooks/useNotifications';
import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBadge({ onClick, className }: NotificationBadgeProps) {
  const { unreadCount } = useNotificationBadge();

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative p-2 rounded-lg hover:bg-gray-100 transition-colors',
        className
      )}
    >
      <Bell className="h-5 w-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
}
