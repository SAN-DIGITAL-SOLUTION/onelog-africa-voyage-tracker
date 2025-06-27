import React from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';

export default function NotificationsCenter() {
  const { user } = useAuth();
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotifications(user?.id || '');
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => setOpen(o => !o)} aria-label="Notifications">
        <Bell />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full px-2 text-xs">{unreadCount}</span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg z-50">
          <div className="p-4 border-b font-semibold">Notifications</div>
          <ul className="max-h-96 overflow-y-auto divide-y">
            {notifications.length === 0 && <li className="p-4 text-gray-500">Aucune notification</li>}
            {notifications.map(n => (
              <li key={n.id} className={`p-4 flex flex-col ${n.read ? 'bg-gray-100' : 'bg-accent/10'}`}>
                <div className="flex items-center justify-between">
                  <span>{n.message}</span>
                  {!n.read && (
                    <Button size="xs" onClick={() => markAsRead(n.id)}>Marquer comme lu</Button>
                  )}
                  <Button size="xs" variant="ghost" onClick={() => removeNotification(n.id)}>Supprimer</Button>
                </div>
                <span className="text-xs text-gray-400 mt-1">{new Date(n.created_at).toLocaleString('fr-FR')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
