import { useEffect, useState } from 'react';
import { fetchLogs } from '../services/adminService';

export default function useLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchLogs().then((data) => {
      setLogs(data);
      setLoading(false);
    });
  }, []);
  return { logs, loading };
}
