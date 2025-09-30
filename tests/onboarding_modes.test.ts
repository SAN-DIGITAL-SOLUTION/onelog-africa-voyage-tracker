import { describe, it, expect } from 'vitest';
import { getUserRoleStatus, canAccessDashboard } from '../src/services/roleUtils';

const users = {
  norole: { id: 'user-norole-uuid', role: null, role_status: null },
  pending: { id: 'user-pending-uuid', role: null, requested_role: 'client', role_status: 'pending' },
  self: { id: 'user-self-uuid', role: 'chauffeur', role_status: 'approved' },
  admin: { id: 'admin-uuid', role: 'admin', role_status: 'approved' },
};

describe('Onboarding Modes', () => {
  it('bloque dashboard si aucun rôle', () => {
    expect(canAccessDashboard(users.norole)).toBe(false);
  });
  it('bloque dashboard si pending', () => {
    expect(canAccessDashboard(users.pending)).toBe(false);
  });
  it('autorise dashboard si role validé', () => {
    expect(canAccessDashboard(users.self)).toBe(true);
  });
});
