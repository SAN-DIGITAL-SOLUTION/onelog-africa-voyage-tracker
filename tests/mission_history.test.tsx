// fichier : tests/mission_history.test.tsx
import { render, screen } from '@testing-library/react';
import MissionHistory from '../src/components/MissionHistory';

test('affiche les missions avec durée', () => {
  render(
    <MissionHistory
      missions={[
        {
          id: 'm1',
          title: 'Mission A',
          check_in_time: '2025-06-20T08:00:00Z',
          check_out_time: '2025-06-20T10:15:00Z',
          status: 'done',
        },
      ]}
    />
  );
  expect(screen.getByText(/2h 15min/)).toBeInTheDocument();
});
