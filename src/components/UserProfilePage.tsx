import React from 'react';
import { useParams } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';

export default function UserProfilePage() {
  const { id } = useParams();
  const { data, error, isLoading } = useUserProfile(id || '');

  if (isLoading) return <div>Chargement...</div>;
  if (error?.message === 'Accès refusé') return <div>Accès refusé</div>;
  if (error) return <div>Erreur : {error.message}</div>;
  if (!data) return <div>Profil introuvable</div>;

  return (
    <div>
      <h1>Mon profil</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
