// fichier: tests/client_dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import ClientDashboard from '../src/pages/ClientDashboard';

describe('ClientDashboard', () => {
  it('affiche les sections principales', () => {
    render(<ClientDashboard />);
    expect(screen.getByText(/Tableau de bord Client/i)).toBeInTheDocument();
    expect(screen.getByText(/Missions en cours/i)).toBeInTheDocument();
    expect(screen.getByText(/Factures récentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
  });
});
