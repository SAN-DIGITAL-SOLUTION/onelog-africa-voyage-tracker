import { useState, useEffect } from 'react';
import { getNotificationPreferences, updateNotificationPreferences } from './notificationPreferencesService';

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    setLoading(true);
    getNotificationPreferences()
      .then((prefs) => {
        setPreferences(prefs || {});
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Erreur chargement préférences');
        setLoading(false);
      });
  }, []);

  function updatePreference(key: string, value: boolean) {
    setPreferences((prev: any) => ({ ...prev, [key]: value }));
    setDirty(true);
  }

  async function savePreferences() {
    setLoading(true);
    try {
      await updateNotificationPreferences(preferences);
      setDirty(false);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Erreur sauvegarde préférences');
      setLoading(false);
    }
  }

  return { preferences, loading, error, updatePreference, savePreferences, dirty };
}
