// Tests unitaires du middleware RBAC admin (Next.js, Supabase)
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from '@vercel/edge';
import { middleware } from '../middleware';

vi.mock('@supabase/supabase-js', () => {
  const mAuth = {
    getUser: vi.fn(),
  };
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

function mockRequest(path = '/admin', cookies = {}) {
  return {
    nextUrl: { pathname: path, origin: 'http://localhost', search: '', href: 'http://localhost'+path },
    cookies: { get: (name) => ({ value: cookies[name] }) },
    url: 'http://localhost'+path,
  } as unknown as NextRequest;
}

describe('middleware RBAC admin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redirige vers /login si aucun cookie', async () => {
    const req = mockRequest('/admin', {});
    const res = await middleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirige vers /login si JWT invalide', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: null } });
    const req = mockRequest('/admin', { 'sb-access-token': 'invalid' });
    const res = await middleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirige vers /login si user sans rôle admin', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } } });
    supabase.createClient().from().select().eq.mockResolvedValue({ data: [{ roles: { name: 'user' } }], error: null });
    const req = mockRequest('/admin', { 'sb-access-token': 'valid' });
    const res = await middleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('laisse passer si user admin', async () => {
    supabase.createClient().auth.getUser.mockResolvedValue({ data: { user: { id: 'admin-1' } } });
    supabase.createClient().from().select().eq.mockResolvedValue({ data: [{ roles: { name: 'admin' } }], error: null });
    const req = mockRequest('/admin', { 'sb-access-token': 'valid' });
    const res = await middleware(req);
    expect(res).toBeInstanceOf(NextResponse);
    expect(res.headers.get('location')).toBeUndefined();
  });
});
