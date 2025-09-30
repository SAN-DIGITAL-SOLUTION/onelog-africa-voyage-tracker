import React, { useEffect, useState } from 'react';
import './App.css';

interface AuditModule {
  name: string;
  covered: boolean;
  types: string;
  critical?: boolean;
}
interface AuditComponent {
  file: string;
  covered: boolean;
  types: string;
}
interface AuditPage {
  file: string;
  covered: boolean;
  types: string;
}
interface AuditData {
  modules: AuditModule[];
  components: AuditComponent[];
  pages: AuditPage[];
}

const STATUS = (ok: boolean) => ok ? '✅' : '⚠️';

function percent(n: number, d: number) {
  return d === 0 ? 0 : Math.round((n / d) * 100);
}

const API = '/docs/TEST_AUDIT.json';

function App() {
  const [data, setData] = useState<AuditData | null>(null);

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(setData);
  }, []);

  if (!data) return <div className="p-8 text-center">Chargement de l’audit…</div>;

  const covered = data.modules.filter(m => m.covered).length;
  const total = data.modules.length;
  const percentModules = percent(covered, total);
  const uncovered = data.modules.filter(m => !m.covered);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🧪 Dashboard QA – Couverture des tests</h1>
      <div className="mb-6">
        <div className="font-semibold">Couverture modules critiques :</div>
        <div className="flex items-center gap-4 mt-2">
          <div className="w-64 bg-gray-200 rounded h-6">
            <div className="bg-green-500 h-6 rounded" style={{width: percentModules+ '%'}} />
          </div>
          <span className="font-mono">{percentModules}%</span>
        </div>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-2">Modules non couverts</h2>
      <ul className="mb-8">
        {uncovered.length === 0 ? <li className="text-green-700">Tous les modules critiques sont couverts 🎉</li> :
          uncovered.map(m => (
            <li key={m.name} className="text-red-600">{m.name} ({m.types || 'aucun test'})</li>
          ))}
      </ul>

      <h2 className="text-xl font-semibold mt-8 mb-2">Détail par composant</h2>
      <table className="w-full text-sm mb-8">
        <thead>
          <tr><th className="text-left">Composant</th><th>Statut</th><th>Type</th></tr>
        </thead>
        <tbody>
        {data.components.map(c => (
          <tr key={c.file}>
            <td>{c.file.replace('src/components/', '')}</td>
            <td className="text-center">{STATUS(c.covered)}</td>
            <td>{c.types || '-'}</td>
          </tr>
        ))}
        </tbody>
      </table>

      <h2 className="text-xl font-semibold mt-8 mb-2">Détail par page</h2>
      <table className="w-full text-sm">
        <thead>
          <tr><th className="text-left">Page</th><th>Statut</th><th>Type</th></tr>
        </thead>
        <tbody>
        {data.pages.map(p => (
          <tr key={p.file}>
            <td>{p.file.replace('src/pages/', '')}</td>
            <td className="text-center">{STATUS(p.covered)}</td>
            <td>{p.types || '-'}</td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
