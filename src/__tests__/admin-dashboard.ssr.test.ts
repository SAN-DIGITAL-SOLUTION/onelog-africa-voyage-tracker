// Tests unitaires getServerSideProps RBAC admin
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerSideProps } from '../modules/adminDashboard/pages/dashboard';

vi.mock('@supabase/supabase-js', () => {
  const mAuth = { getUser: vi.fn() };
  const mFrom = vi.fn().mockReturnThis();
  const mSelect = vi.fn().mockReturnThis();
  const mEq = vi.fn().mockReturnThis();
  return {
    createClient: vi.fn(() => ({
      auth: mAuth,
      from: vi.fn(() => ({ select: mSelect, eq: mEq })),
    })),
  };
});

const supabase = require('@supabase/supabase-js');

function mockCtx(cookie, userId, roleName) {
  return {
    req: { cookies: { 'sb-access-token': cookie } },
  } as any;
}

describe('getServerSideProps RBAC admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige vers /login si pas de token', async () => {
    const ctx = mockCtx(undefined, undefined, undefined);
    const res = await getServerSideProps(ctx);
    expect(res).toEqual({ redirect: { destination: '/login', permanent: false } });
  });

  it('redirige vers /login si JWT invalide', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: null } });
    const ctx = mockCtx('invalid', null, null);
    const res = await getServerSideProps(ctx);
    expect(res).toEqual({ redirect: { destination: '/login', permanent: false } });
  });

  it('redirige vers /login si user sans rôle admin', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.createClient().from().select().eq.mockResolvedValue({ data: [{ roles: { name: 'user' } }], error: null });
    const ctx = mockCtx('valid', 'user-1', 'user');
    const res = await getServerSideProps(ctx);
    expect(res).toEqual({ redirect: { destination: '/login', permanent: false } });
  });

  it('retourne props si user admin', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    supabase.createClient().from().select().eq.mockResolvedValue({ data: [{ roles: { name: 'admin' } }], error: null });
    const ctx = mockCtx('valid', 'admin-1', 'admin');
    const res = await getServerSideProps(ctx);
    expect(res).toEqual({ props: {} });
  });
});
