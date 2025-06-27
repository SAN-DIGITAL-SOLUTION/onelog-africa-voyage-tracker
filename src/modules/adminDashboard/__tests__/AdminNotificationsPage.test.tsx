import { render, screen } from '@testing-library/react';
import AdminNotificationsPage from '../pages/notifications';

describe('AdminNotificationsPage', () => {
  it('affiche le résumé des notifications', () => {
    render(<AdminNotificationsPage />);
    expect(screen.getByText('Notifications')).toBeInTheDocument();
  });
});
