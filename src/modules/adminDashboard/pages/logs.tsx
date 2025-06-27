import DashboardLayout from '../components/DashboardLayout';
import LogTable from '../components/LogTable';
import RealtimeLogStream from '../components/RealtimeLogStream';
import useLogs from '../hooks/useLogs';

export default function AdminLogsPage() {
  const { logs, loading } = useLogs();
  return (
    <DashboardLayout>
      <h1>Logs et indicateurs live</h1>
      <RealtimeLogStream />
      <LogTable logs={logs} loading={loading} />
    </DashboardLayout>
  );
}
