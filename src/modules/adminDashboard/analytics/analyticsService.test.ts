import { fetchUsersPerDay, fetchMissionsPerDay } from './analyticsService';

test('fetchUsersPerDay returns 7 days', async () => {
  const res = await fetchUsersPerDay(7);
  expect(res.labels.length).toBe(7);
  expect(res.data.length).toBe(7);
});

test('fetchMissionsPerDay returns 7 days', async () => {
  const res = await fetchMissionsPerDay(7);
  expect(res.labels.length).toBe(7);
  expect(res.data.length).toBe(7);
});
