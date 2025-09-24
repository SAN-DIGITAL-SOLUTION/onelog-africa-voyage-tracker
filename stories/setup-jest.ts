// Configuration pour les tests avec Vitest dans Storybook
import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Configuration des variables d'environnement de test
process.env.NODE_ENV = 'test';

// Configuration des mocks globaux
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn(),
    signUp: vi.fn(),
    loading: false,
    user: null,
  }),
}));

vi.mock('@/hooks/useRole', () => ({
  useRole: () => ({
    role: null,
    loadingRole: false,
  }),
}));
