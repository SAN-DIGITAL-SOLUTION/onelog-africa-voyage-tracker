import { render, screen } from '@testing-library/react';
import AdminDashboardPage from '../pages/dashboard';

describe('AdminDashboardPage', () => {
  it('affiche les stats et le résumé des notifications', () => {
    render(<AdminDashboardPage />);
    expect(screen.getByText('Vue générale du système')).toBeInTheDocument();
    expect(screen.getByText('Utilisateurs')).toBeInTheDocument();
    expect(screen.getByText('Missions')).toBeInTheDocument();
    expect(screen.getByText('Notifications')).toBeInTheDocument();
    expect(screen.getByText(/Taux d'envoi/)).toBeInTheDocument();
  });
});
