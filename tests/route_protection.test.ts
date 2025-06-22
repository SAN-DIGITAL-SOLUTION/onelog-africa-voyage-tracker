import { describe, it, expect } from 'vitest';
import { canAccessDashboard, canAccessAdmin } from '../src/services/roleUtils';

const users = {
  norole: { id: 'user-norole-uuid', role: null, role_status: null },
  pending: { id: 'user-pending-uuid', role: null, requested_role: 'client', role_status: 'pending' },
  self: { id: 'user-self-uuid', role: 'chauffeur', role_status: 'approved' },
  admin: { id: 'admin-uuid', role: 'admin', role_status: 'approved' },
};

describe('Protection des routes', () => {
  it('bloque dashboard si pas de rôle validé', () => {
    expect(canAccessDashboard(users.norole)).toBe(false);
  });
  it('autorise dashboard si role_status = approved', () => {
    expect(canAccessDashboard(users.self)).toBe(true);
  });
  it('autorise accès admin uniquement pour admin', () => {
    expect(canAccessAdmin(users.admin)).toBe(true);
    expect(canAccessAdmin(users.norole)).toBe(false);
  });
});
