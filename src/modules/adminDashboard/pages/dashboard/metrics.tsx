import DashboardLayout from '../../components/DashboardLayout';
import AnalyticsDashboard from '../../analytics/AnalyticsDashboard';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<{ labels: string[]; data: number[] }>({ labels: [], data: [] });
  useEffect(() => {
    fetchMetricsData().then(setMetrics);
  }, []);
  return (
    <DashboardLayout>
      <h1>Métriques système</h1>
      <MetricsChart data={metrics.data} labels={metrics.labels} title="Notifications envoyées par jour" />
      <button onClick={() => exportMetricsCSV(metrics)} style={{ marginTop: 24, background: '#2563eb', color: '#fff', borderRadius: 4, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>Exporter CSV</button>
    </DashboardLayout>
  );
}
