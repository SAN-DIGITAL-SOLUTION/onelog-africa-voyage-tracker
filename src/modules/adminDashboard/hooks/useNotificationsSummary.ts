import { useEffect, useState } from 'react';
import { fetchNotificationsSummary } from '../services/adminService';

export default function useNotificationsSummary() {
  const [summary, setSummary] = useState({ total: 0, failed: 0, sent: 0, retrying: 0 });
  useEffect(() => {
    fetchNotificationsSummary().then(setSummary);
  }, []);
  return summary;
}
