// fichier : tests/checkin_checkout.test.tsx
import { render, screen } from '@testing-library/react';
import MissionList from '../src/components/MissionList';

test('affiche le bouton Check-in si non effectué', () => {
  render(
    <MissionList
      missions={[
        { id: '1', title: 'Mission A', status: 'active', start_date: new Date().toISOString(), checked_in: false, checked_out: false },
      ]}
    />
  );
  expect(screen.getByText(/check-in/i)).toBeInTheDocument();
});
