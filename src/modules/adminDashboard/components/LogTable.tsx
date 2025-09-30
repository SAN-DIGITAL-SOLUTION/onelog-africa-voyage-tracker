import React from 'react';

interface Log {
  timestamp: string;
  level: string;
  message: string;
  module: string;
}

import React, { useState } from 'react';

interface Log {
  timestamp: string;
  level: string;
  message: string;
  module: string;
}

const LEVELS = ['info', 'warning', 'error', 'debug'];

export default function LogTable({ logs, loading }: { logs: Log[]; loading: boolean }) {
  const [level, setLevel] = useState<string>('');
  const [module, setModule] = useState<string>('');
  const [search, setSearch] = useState('');

  const modules = Array.from(new Set(logs.map(l => l.module))).sort();
  const filtered = logs.filter(log =>
    (!level || log.level === level) &&
    (!module || log.module === module) &&
    (!search || log.message.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ marginTop: 24 }}>
      <h2>Logs récents</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
        <select value={level} onChange={e => setLevel(e.target.value)}>
          <option value=''>Tous niveaux</option>
          {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={module} onChange={e => setModule(e.target.value)}>
          <option value=''>Tous modules</option>
          {modules.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Recherche message...' style={{ flex: 1, minWidth: 180 }} />
      </div>
      {loading ? <p>Chargement…</p> : (
        <table style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', marginTop: 8 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Niveau</th>
              <th>Module</th>
              <th>Message</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, i) => (
              <tr key={i}>
                <td>{log.timestamp}</td>
                <td>{log.level}</td>
                <td>{log.module}</td>
                <td>{log.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
