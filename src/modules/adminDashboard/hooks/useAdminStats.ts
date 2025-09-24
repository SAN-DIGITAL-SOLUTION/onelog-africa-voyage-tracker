import { useEffect, useState } from 'react';
import { fetchAdminStats } from '../services/adminService';

export default function useAdminStats() {
  const [stats, setStats] = useState({ users: 0, missions: 0, notifications: 0, sendRate: 0 });
  useEffect(() => {
    fetchAdminStats().then(setStats);
  }, []);
  return stats;
}
