import { describe, it, expect } from 'vitest';
import { isAdmin, canModerateRoles } from '../src/services/roleUtils';

describe('Modération des rôles', () => {
  const admin = { id: 'admin-uuid', role: 'admin' };
  const pending = { id: 'user-pending-uuid', role: null };

  it('admin peut modérer', () => {
    expect(canModerateRoles(admin)).toBe(true);
  });
  it('non-admin ne peut pas modérer', () => {
    expect(canModerateRoles(pending)).toBe(false);
  });
});
