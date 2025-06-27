import { useEffect, useState } from 'react';
import { getUserRoles } from './authService';

export function useRoles(userId?: string) {
  const [roles, setRoles] = useState<string[]>([]);
  useEffect(() => {
    if (!userId) return;
    getUserRoles(userId).then(setRoles);
  }, [userId]);
  return roles;
}
