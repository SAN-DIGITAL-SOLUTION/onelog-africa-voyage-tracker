import React from 'react';

export type UserCardProps = {
  id: string;
  name: string;
  role: string;
  onEdit?: () => void;
};

export const UserCard: React.FC<UserCardProps> = ({ id, name, role, onEdit }) => (
  <div style={{
    border: '1px solid #eee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    background: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  }}>
    <div>
      <div style={{ fontWeight: 700 }}>{name}</div>
      <div style={{ color: 'var(--color-secondary)' }}>{role}</div>
    </div>
    {onEdit && (
      <button onClick={onEdit} style={{ background: 'var(--color-accent-cta)', color: '#fff', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer' }}>
        Modifier
      </button>
    )}
  </div>
);
