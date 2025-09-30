import React, { useEffect, useState } from 'react';
import { subscribeToLogs } from '../services/adminService';

export default function RealtimeLogStream() {
  const [liveLogs, setLiveLogs] = useState<{ timestamp: string; message: string; level: string; module: string }[]>([]);
  useEffect(() => {
    const unsub = subscribeToLogs((log) => setLiveLogs((prev) => [log, ...prev.slice(0, 19)]));
    return () => unsub();
  }, []);
  return (
    <div style={{ background: '#222', color: '#fff', padding: 16, borderRadius: 8, marginBottom: 24, minHeight: 80 }}>
      <strong>Live logs :</strong>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {liveLogs.map((log, i) => (
          <li key={i} style={{ fontSize: 12, margin: 0, padding: 0 }}>
            [{log.timestamp}] <span style={{ color: '#0ff' }}>{log.level}</span> <span style={{ color: '#ff0' }}>{log.module}</span> {log.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
