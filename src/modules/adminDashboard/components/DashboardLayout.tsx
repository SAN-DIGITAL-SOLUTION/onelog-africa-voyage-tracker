import React from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: 32, background: '#f9fafb', minHeight: '100vh' }}>
      <nav style={{ marginBottom: 32 }}>
        <a href="/admin/dashboard" style={{ marginRight: 24 }}>Vue générale</a>
        <a href="/admin/logs" style={{ marginRight: 24 }}>Logs</a>
        <a href="/admin/notifications">Notifications</a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
