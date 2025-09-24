import React, { useState } from 'react';

export default function UserModal({ onSave, onClose, initial }: { onSave: (user: { email: string; name: string }) => void; onClose: () => void; initial?: { email: string; name: string } }) {
  const [email, setEmail] = useState(initial?.email || '');
  const [name, setName] = useState(initial?.name || '');
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: 8, padding: 32, minWidth: 320 }}>
        <h2>{initial ? 'Modifier' : 'Créer'} un utilisateur</h2>
        <div style={{ marginBottom: 12 }}>
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
          <input type="text" placeholder="Nom" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => onSave({ email, name })} style={{ background: '#2563eb', color: '#fff', padding: '8px 20px', borderRadius: 4 }}>Enregistrer</button>
          <button onClick={onClose} style={{ background: '#eee', color: '#333', padding: '8px 20px', borderRadius: 4 }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}
