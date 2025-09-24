import { Layout } from '../components/Layout';
import { UserCard } from '../components/UserCard';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getUserProfile } from '../services/userProfileService';
import type { UserProfile } from '../types/userProfile.types';

import { GetServerSidePropsContext } from 'next';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});

export default function UserProfilePage() {
  const router = useRouter();
  const { id } = router.query;
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getUserProfile(String(id))
      .then((data) => setUser(data))
      .catch((error) => setError('Erreur lors du chargement du profil'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div>Chargement…</div>
      </Layout>
    );
  }
  if (error || !user) {
    return (
      <Layout>
        <div>Utilisateur introuvable.</div>
      </Layout>
    );
  }
  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Profil utilisateur</h1>
      <UserCard id={user.id} name={user.fullName || user.email} role={user.role} onEdit={() => router.push(`/user-profiles/${user.id}/edit`)} />
    </Layout>
  );
}
