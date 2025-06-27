import React from 'react';

export default function NotificationToast({ toasts }: { toasts: any[] }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-white text-black shadow-lg rounded-md p-4 border border-gray-200 animate-slide-in"
          role="alert"
          tabIndex={0}
        >
          <div className="font-semibold flex items-center gap-2">
            {toast.type === 'error' && <span className="text-red-500">●</span>}
            {toast.type === 'user_created' && <span className="text-blue-500">●</span>}
            {toast.type === 'mission_created' && <span className="text-green-500">●</span>}
            {toast.type === 'role_changed' && <span className="text-indigo-500">●</span>}
            {toast.type === 'notification_failed' && <span className="text-red-400">●</span>}
            {toast.type === 'notification_sent' && <span className="text-green-400">●</span>}
            <span>{toast.title}</span>
          </div>
          <div className="text-sm">{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
