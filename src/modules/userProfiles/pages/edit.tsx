import { Layout } from '../components/Layout';
import { UserForm } from '../components/UserForm';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useUserProfile } from '../hooks/useUserProfile';

import { GetServerSidePropsContext } from 'next';
import { withPageAuth } from '@supabase/auth-helpers-nextjs';

export const getServerSideProps = withPageAuth({
  redirectTo: '/login',
});

export default function EditUserPage() {
  const router = useRouter();
  const { id } = router.query;
  const { profile, loading, error, save } = useUserProfile(String(id));
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.fullName || '');
      setRole(profile.role || '');
    }
  }, [profile]);

  function handleChange(field: string, value: string) {
    if (field === 'name') setName(value);
    if (field === 'role') setRole(value);
  }

  async function handleSubmit() {
    setSaving(true);
    await save({ fullName: name, role });
    setSaving(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  }

  if (loading) return <Layout><div>Chargement…</div></Layout>;
  if (error || !profile) return <Layout><div>Profil introuvable.</div></Layout>;

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-4">Édition du profil</h1>
      {success && <div style={{ color: 'green', marginBottom: 12 }}>Profil mis à jour !</div>}
      <UserForm name={name} role={role} onChange={handleChange} onSubmit={handleSubmit} isEditing />
      {saving && <div>Enregistrement…</div>}
    </Layout>
  );
}
