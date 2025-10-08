import { useEffect, useState } from 'react';
import { getUser, getUserRoles } from './authService';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const u = await getUser();
      setUser(u);
      if (u?.id) setRoles(await getUserRoles(u.id));
      setLoading(false);
    })();
  }, []);

  return { user, roles, loading };
}

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) return;
    getUserRoles(userId).then(setRoles);
  }, [userId]);
  return roles;
}
