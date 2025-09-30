import { useState, useEffect } from 'react';
import { getUserProfile, updateUserProfile } from '../services/userProfileService';
import type { UserProfile } from '../types/userProfile.types';

export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getUserProfile(userId)
      .then(setProfile)
      .catch(() => setError('Erreur lors du chargement du profil'))
      .finally(() => setLoading(false));
  }, [userId]);

  const save = async (updates: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const updated = await updateUserProfile(userId, updates);
      setProfile(updated);
    } catch {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return { profile, loading, error, save };
}
