import React, { useEffect, useState } from 'react';
import { getNotifications, markAsRead } from '../services/notificationsService';

export default function NotificationSidebar({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  useEffect(() => {
    if (open) getNotifications({ filter }).then(setNotifications);
  }, [open, filter]);
  return (
    <div style={{ position: 'fixed', top: 0, right: open ? 0 : -400, width: 400, height: '100vh', background: '#fff', boxShadow: '-2px 0 8px #0002', transition: 'right 0.3s', zIndex: 1100 }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8 }}>✖️</button>
      <h3 style={{ margin: 24 }}>Notifications</h3>
      <select value={filter} onChange={e => setFilter(e.target.value)} style={{ margin: 16 }}>
        <option value="all">Toutes</option>
        <option value="user_created">Utilisateurs</option>
        <option value="mission_created">Missions</option>
        <option value="notification_sent">Envois réussis</option>
        <option value="notification_failed">Échecs</option>
        <option value="role_changed">Changements de rôle</option>
        <option value="error">Erreurs critiques</option>
      </select>
      <div style={{ maxHeight: '80vh', overflowY: 'auto', padding: 16 }}>
        {notifications.map(n => (
          <div key={n.id} style={{ borderBottom: '1px solid #eee', padding: 12, background: n.is_read ? '#f9fafb' : '#fff' }}>
            <div style={{ fontWeight: n.is_read ? 400 : 700 }}>{n.summary || n.type}</div>
            <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.created_at).toLocaleString()}</div>
            {!n.is_read && <button style={{ fontSize: 12, marginTop: 6 }} onClick={() => { markAsRead(n.id); n.is_read = true; setNotifications([...notifications]); }}>Marquer comme lue</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
