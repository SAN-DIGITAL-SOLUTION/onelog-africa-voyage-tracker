import React from 'react';

export default function StatsCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div style={{ background: '#fff', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee', minWidth: 160 }}>
      <div style={{ fontSize: 32, fontWeight: 700 }}>{value}</div>
      <div style={{ color: '#444', marginTop: 8 }}>{title}</div>
    </div>
  );
}
