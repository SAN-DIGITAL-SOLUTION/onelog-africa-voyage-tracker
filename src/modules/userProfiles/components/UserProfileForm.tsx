import React from 'react';
import type { UserProfile } from '../types/userProfile.types';

interface Props {
  profile: UserProfile;
  onChange: (profile: Partial<UserProfile>) => void;
  onSave: () => void;
  loading?: boolean;
}

export const UserProfileForm: React.FC<Props> = ({ profile, onChange, onSave, loading }) => {
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(); }}>
      <label>Email
        <input type="email" value={profile.email} disabled />
      </label>
      <label>Nom complet
        <input type="text" value={profile.fullName} onChange={e => onChange({ fullName: e.target.value })} />
      </label>
      <label>Rôle
        <select value={profile.role} onChange={e => onChange({ role: e.target.value as UserProfile['role'] })}>
          <option value="admin">Admin</option>
          <option value="operator">Opérateur</option>
          <option value="client">Client</option>
        </select>
      </label>
      <button type="submit" disabled={loading}>Enregistrer</button>
    </form>
  );
};
