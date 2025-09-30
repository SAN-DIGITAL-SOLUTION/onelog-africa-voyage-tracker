import React, { useState, useEffect } from 'react';
import { getUserRoles, setUserRoles } from '../../auth/authService';

import { getAllRoles } from '../../auth/authService';

export default function UserRolesModal({ userId, onClose, onSave }: { userId: string, onClose: () => void, onSave: () => void }) {
  const [roles, setRolesState] = useState<string[]>([]);
  const [allRoles, setAllRoles] = useState<{ name: string, description: string }[]>([]);
  useEffect(() => {
    getUserRoles(userId).then(setRolesState);
    getAllRoles().then(rs => setAllRoles(rs.map(({ name, description }) => ({ name, description }))));
  }, [userId]);
  const toggle = (role: string) => setRolesState(r => r.includes(role) ? r.filter(x => x !== role) : [...r, role]);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320 }}>
        <h2>Rôles de l'utilisateur</h2>
        <div style={{ marginBottom: 12 }}>
          {allRoles.map(role => (
            <label key={role.name} style={{ display: 'block', marginBottom: 8 }}>
              <input type="checkbox" checked={roles.includes(role.name)} onChange={() => toggle(role.name)} /> {role.name}
              {role.description && <span style={{ color: '#888', fontSize: 12, marginLeft: 8 }}>{role.description}</span>}
            </label>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={async () => { await setUserRoles(userId, roles); onSave(); onClose(); }} style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 4 }}>Enregistrer</button>
          <button onClick={onClose} style={{ background: '#eee', color: '#333', padding: '8px 20px', borderRadius: 4 }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
