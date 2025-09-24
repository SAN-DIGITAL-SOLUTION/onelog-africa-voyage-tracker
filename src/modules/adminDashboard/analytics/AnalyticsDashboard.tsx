import React, { useEffect, useState } from 'react';
import MetricsChart from '../components/MetricsChart';
import { fetchUsersPerDay, fetchMissionsPerDay, exportCSV } from './analyticsService';

export default function AnalyticsDashboard() {
  const [users, setUsers] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [missions, setMissions] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  const [range, setRange] = useState(7);
  useEffect(() => {
    fetchUsersPerDay(range).then(setUsers);
    fetchMissionsPerDay(range).then(setMissions);
  }, [range]);
  return (
    <div>
      <h2>Analytics avancés</h2>
      <div style={{ display: 'flex', gap: 32 }}>
        <div style={{ flex: 1 }}>
          <MetricsChart data={users.data} labels={users.labels} title="Nouveaux utilisateurs/jour" />
          <button onClick={() => exportCSV(users, 'users_per_day.csv')} style={{ marginTop: 8 }}>Exporter CSV</button>
        </div>
        <div style={{ flex: 1 }}>
          <MetricsChart data={missions.data} labels={missions.labels} title="Missions créées/jour" />
          <button onClick={() => exportCSV(missions, 'missions_per_day.csv')} style={{ marginTop: 8 }}>Exporter CSV</button>
        </div>
      </div>
      <div style={{ marginTop: 16 }}>
        <label>Plage (jours) : </label>
        <select value={range} onChange={e => setRange(Number(e.target.value))}>
          {[7, 14, 30].map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
  );
}
