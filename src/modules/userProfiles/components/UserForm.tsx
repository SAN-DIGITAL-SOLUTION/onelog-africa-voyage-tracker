import React from 'react';

export type UserFormProps = {
  name: string;
  role: string;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  isEditing?: boolean;
};

export const UserForm: React.FC<UserFormProps> = ({ name, role, onChange, onSubmit, isEditing }) => (
  <form
    onSubmit={e => {
      e.preventDefault();
      onSubmit();
    }}
    style={{ background: '#fff', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px #eee', maxWidth: 400 }}
  >
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>Nom</label>
      <input
        type="text"
        value={name}
        onChange={e => onChange('name', e.target.value)}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        required
      />
    </div>
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontWeight: 600 }}>Rôle</label>
      <select
        value={role}
        onChange={e => onChange('role', e.target.value)}
        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
        required
      >
        <option value="">Sélectionner</option>
        <option value="Admin">Admin</option>
        <option value="Utilisateur">Utilisateur</option>
        <option value="Opérateur">Opérateur</option>
        <option value="Client">Client</option>
      </select>
    </div>
    <button type="submit" style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 4, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>
      {isEditing ? 'Enregistrer' : 'Créer'}
    </button>
  </form>
);
