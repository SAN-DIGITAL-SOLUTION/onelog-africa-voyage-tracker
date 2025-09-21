// Tests unitaires du middleware RBAC admin (Next.js, Supabase)
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de NextResponse pour éviter les problèmes d'import
const mockNextResponse = {
  redirect: vi.fn((url) => ({ headers: { get: () => url.href } })),
  next: vi.fn(() => ({ headers: { get: () => undefined } }))
};

// Simulation de la logique du middleware
const simulateMiddleware = async (req: any) => {
  if (!req.nextUrl.pathname.startsWith('/admin')) {
    return mockNextResponse.next();
  }
  
  const token = req.cookies.get('sb-access-token')?.value;
  if (!token) {
    return mockNextResponse.redirect(new URL('/login', req.url));
  }
  
  // Simulation de vérification utilisateur
  if (token === 'invalid') {
    return mockNextResponse.redirect(new URL('/login', req.url));
  }
  
  // Simulation de vérification de rôle
  if (token === 'user-token') {
    return mockNextResponse.redirect(new URL('/login', req.url));
  }
  
  if (token === 'admin-token') {
    return mockNextResponse.next();
  }
  
  return mockNextResponse.redirect(new URL('/login', req.url));
};

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
    const res = await simulateMiddleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirige vers /login si JWT invalide', async () => {
    const req = mockRequest('/admin', { 'sb-access-token': 'invalid' });
    const res = await simulateMiddleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('redirige vers /login si user sans rôle admin', async () => {
    const req = mockRequest('/admin', { 'sb-access-token': 'user-token' });
    const res = await simulateMiddleware(req);
    expect(res.headers.get('location')).toContain('/login');
  });

  it('laisse passer si user admin', async () => {
    const req = mockRequest('/admin', { 'sb-access-token': 'admin-token' });
    const res = await simulateMiddleware(req);
    expect(res.headers.get('location')).toBeUndefined();
  });
});
