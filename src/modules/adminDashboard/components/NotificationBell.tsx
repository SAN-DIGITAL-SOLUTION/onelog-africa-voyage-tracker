import React, { useEffect, useState } from 'react';
import { getNotifications, markAllAsRead } from '../services/notificationsService';

export default function NotificationBell({ onClick }: { onClick: () => void }) {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    getNotifications({ onlyUnread: true }).then(n => setUnreadCount(n.length));
  }, []);
  return (
    <div style={{ position: 'relative', cursor: 'pointer' }} onClick={onClick}>
      <span role="img" aria-label="notifications" style={{ fontSize: 28 }}>🔔</span>
      {unreadCount > 0 && (
        <span style={{ position: 'absolute', top: 0, right: 0, background: '#f43f5e', color: '#fff', borderRadius: '50%', padding: '2px 7px', fontSize: 12 }}>{unreadCount}</span>
      )}
    </div>
  );
}
