import { getUserRoles, setUserRoles } from './authService';

test('setUserRoles and getUserRoles roundtrip', async () => {
  const userId = 'test-user-id';
  await setUserRoles(userId, ['admin', 'user']);
  const roles = await getUserRoles(userId);
  expect(roles).toEqual(expect.arrayContaining(['admin', 'user']));
});
