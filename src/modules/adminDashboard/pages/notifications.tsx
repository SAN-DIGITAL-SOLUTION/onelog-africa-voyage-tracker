import DashboardLayout from '../components/DashboardLayout';
import NotificationSummary from '../components/NotificationSummary';
import useNotificationsSummary from '../hooks/useNotificationsSummary';

export default function AdminNotificationsPage() {
  const summary = useNotificationsSummary();
  return (
    <DashboardLayout>
      <h1>Notifications</h1>
      <NotificationSummary {...summary} />
    </DashboardLayout>
  );
}
