import React, { useState, useRef, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../hooks/useNotifications';

export default function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Marquer toutes comme lues à l'ouverture
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
      unreadIds.forEach(id => markAsRead(id));
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        aria-label={unreadCount > 0 ? `${unreadCount} new notifications` : 'Notifications'}
        className="relative focus:outline-none"
        onClick={() => setIsOpen(v => !v)}
      >
        <BellIcon className="h-6 w-6 text-gray-700" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-xs text-white rounded-full px-1" role="status">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-md z-50 border border-gray-200 animate-fade-in">
          <div className="p-4 border-b font-semibold">Notifications</div>
          <ul className="max-h-64 overflow-y-auto" tabIndex={0} role="listbox">
            {notifications.length === 0 && (
              <li className="p-3 text-gray-400">Aucune notification</li>
            )}
            {notifications.map((notif) => (
              <li
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 focus:bg-gray-100 outline-none ${notif.read ? 'text-gray-500' : 'font-medium'}`}
                tabIndex={0}
                role="option"
                aria-selected={!notif.read}
              >
                <div className="flex items-center gap-2">
                  {notif.type === 'error' && <span className="text-red-500">●</span>}
                  {notif.type === 'user_created' && <span className="text-blue-500">●</span>}
                  {notif.type === 'mission_created' && <span className="text-green-500">●</span>}
                  {notif.type === 'role_changed' && <span className="text-indigo-500">●</span>}
                  {notif.type === 'notification_failed' && <span className="text-red-400">●</span>}
                  {notif.type === 'notification_sent' && <span className="text-green-400">●</span>}
                  <span>{notif.title}</span>
                </div>
                <div className="text-sm text-gray-400">{notif.message}</div>
                <div className="text-xs text-gray-300">{new Date(notif.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
