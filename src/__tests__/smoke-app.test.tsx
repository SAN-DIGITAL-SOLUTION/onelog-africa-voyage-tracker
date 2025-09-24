// Mock IntersectionObserver pour Framer Motion (JSDOM)
global.IntersectionObserver = class {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
};

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../hooks/useAuth';
import { RoleProvider } from '../hooks/useRole';

const queryClient = new QueryClient();

// Mock window.matchMedia for jsdom
globalThis.window.matchMedia = globalThis.window.matchMedia || function(query) {
  return {
    matches: false,
    media: query,
    onchange: null,
    addListener: function() {},
    removeListener: function() {},
    addEventListener: function() {},
    removeEventListener: function() {},
    dispatchEvent: function() { return false; }
  };
};

describe('Smoke test navigation OneLog', () => {
  it('landing page (/) ne contient pas sidebar ni header', async () => {
    window.history.pushState({}, '', '/');
    // Mock utilisateur non connecté
    const useAuthModule = await import('../hooks/useAuth');
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signUp: vi.fn(),
      signIn: vi.fn(),
      signOut: vi.fn(),
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </RoleProvider>
      </QueryClientProvider>
    );
    // Sidebar principale absente sur landing
    expect(screen.queryByLabelText('Sidebar principale')).toBeNull();
    // Doit contenir le header landing
    expect(screen.getByTestId('landing-header')).toBeInTheDocument();
  });

  it('renders dashboard route and sidebar/header', async () => {
    window.history.pushState({}, '', '/dashboard');
    // Mock user to simulate authenticated session
    // Import dynamique compatible ES pour le mock
    const useAuthModule = await import('../hooks/useAuth');
    vi.spyOn(useAuthModule, 'useAuth').mockReturnValue({
      user: {
        id: 'test-id',
        email: 'test@onelog.africa',
        role: 'admin',
        aud: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: '2024-01-01T00:00:00Z',
      },
      session: null,
      loading: false,
      signUp: vi.fn(async () => ({ error: null })),
      signIn: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(),
    });
    render(
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </RoleProvider>
      </QueryClientProvider>
    );
    const dashMatches = await screen.findAllByText(/Tableau de bord/i);
    expect(dashMatches.length).toBeGreaterThan(0);
    // Sidebar principale présente sur dashboard
    expect(screen.getByLabelText('Sidebar principale')).toBeInTheDocument();
    const oneLogMatches = await screen.findAllByText(/OneLog Africa/i);
    expect(oneLogMatches.length).toBeGreaterThan(0); // Sidebar ou header
  });

  it('renders missions page from sidebar nav', async () => {
    window.history.pushState({}, '', '/missions');
    render(
      <QueryClientProvider client={queryClient}>
        <RoleProvider>
          <AuthProvider>
            <App />
          </AuthProvider>
        </RoleProvider>
      </QueryClientProvider>
    );
    expect(await screen.findByText(/Missions/i)).toBeInTheDocument();
  });
});
