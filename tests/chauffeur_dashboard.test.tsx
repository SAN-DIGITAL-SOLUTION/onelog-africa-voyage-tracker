// fichier: tests/chauffeur_dashboard.test.tsx
import { render, screen } from '@testing-library/react';
import ChauffeurDashboard from '../src/pages/ChauffeurDashboard';

describe('ChauffeurDashboard', () => {
  it('affiche les sections principales', () => {
    render(<ChauffeurDashboard />);
    expect(screen.getByText(/Tableau de bord Chauffeur/i)).toBeInTheDocument();
    expect(screen.getByText(/Missions assignées/i)).toBeInTheDocument();
    expect(screen.getByText(/Notifications/i)).toBeInTheDocument();
  });
});
