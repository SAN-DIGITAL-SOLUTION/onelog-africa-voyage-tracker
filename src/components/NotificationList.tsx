// fichier: src/components/NotificationList.tsx
import React from 'react';

type Notification = {
  id: string;
  message: string;
  created_at: string;
  read: boolean;
};

export default function NotificationList({ notifications }: { notifications: Notification[] }) {
  if (!notifications.length) return <p>Aucune notification.</p>;
  return (
    <ul className="space-y-2">
      {notifications.map(n => (
        <li key={n.id} className={`p-3 rounded ${n.read ? 'bg-gray-100' : 'bg-primary/10'}`}>
          <div>{n.message}</div>
          <div className="text-xs text-gray-500">{new Date(n.created_at).toLocaleString()}</div>
        </li>
      ))}
    </ul>
  );
}
