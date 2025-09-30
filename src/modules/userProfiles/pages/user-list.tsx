import { Layout } from '../components/Layout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listUserProfiles } from '../services/userProfileService';
import type { UserProfile } from '../types/userProfile.types';

import { GetServerSidePropsContext } from 'next';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});

export default function UserListPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    listUserProfiles()
      .then(setUsers)
      .catch(() => setError('Erreur lors du chargement des utilisateurs'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Liste des utilisateurs</h1>
      {loading && <div>Chargement…</div>}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <ul>
        {users.map((user) => (
          <li key={user.id} className="mb-2">
            <Link href={`/user-profiles/${user.id}`}>
              <span className="text-blue-600 hover:underline">
                {user.fullName || user.email} ({user.role})
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Layout>
  );
}
