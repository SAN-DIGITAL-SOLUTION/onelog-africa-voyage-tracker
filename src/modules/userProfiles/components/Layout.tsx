import React from 'react';

import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useUser();
  const supabase = useSupabaseClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <>
      <header
        style={{
          backgroundColor: 'var(--color-primary)',
          padding: '1rem 2rem',
          color: 'white',
          fontFamily: 'var(--font-title)',
          fontWeight: 700,
          fontSize: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>SAN Digital Solutions - Notifications Core</span>
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: '1rem', fontWeight: 400 }}>
              {user.email} {user.user_metadata?.role && `(${user.user_metadata.role})`}
            </span>
            <button
              onClick={handleLogout}
              style={{ background: '#fff', color: 'var(--color-primary)', border: 'none', borderRadius: 4, padding: '6px 14px', cursor: 'pointer', fontWeight: 700 }}
            >
              Déconnexion
            </button>
          </div>
        )}
      </header>
      <main style={{ padding: '2rem', fontFamily: 'var(--font-text)' }}>{children}</main>
    </>
  );
};
