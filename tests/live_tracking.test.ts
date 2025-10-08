// fichier : tests/live_tracking.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useLiveTracking } from '../src/hooks/useLiveTracking';
import { supabase } from '../src/services/supabaseClient';

jest.mock('../src/services/supabaseClient'); // stub Supabase

test('initialise et met à jour les points', async () => {
  // Simuler initial data
  (supabase.from as jest.Mock).mockReturnValue({
    select: () => ({ eq: () => ({ order: () => Promise.resolve({ data: [{ id: '1', mission_id: 'm1', latitude: 0, longitude: 0, created_at: new Date().toISOString() }] }) }) }),
    channel: () => ({
      on: () => ({ subscribe: () => ({}) }),
    }),
    removeChannel: () => {},
  });
  const { result, waitForNextUpdate } = renderHook(() => useLiveTracking('m1'));
  await waitForNextUpdate();
  expect(result.current.length).toBe(1);
});
