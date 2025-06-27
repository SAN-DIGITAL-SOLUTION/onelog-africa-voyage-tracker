import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toHaveNoViolations, axe } from 'jest-axe';
import { Auth } from '../Auth';

expect.extend(toHaveNoViolations);

// Mock des hooks et dépendances
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
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

describe('Auth Component', () => {
  const originalLocalStorage = window.localStorage;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    };
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
    });
  });

  const renderAuth = () => {
    return render(
      <MemoryRouter>
        <Auth />
      </MemoryRouter>
    );
  };

  it('renders login form by default', () => {
    renderAuth();
    
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse email')).toBeInTheDocument();
    expect(screen.getByLabelText('Mot de passe')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
    expect(screen.getByText("Vous n'avez pas de compte ?")).toBeInTheDocument();
  });

  it('switches between login and signup forms', () => {
    renderAuth();
    
    // Vérifier que le formulaire de connexion est affiché par défaut
    expect(screen.getByText('Connexion')).toBeInTheDocument();
    
    // Cliquer sur le bouton pour basculer vers l'inscription
    const switchButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(switchButton);
    
    // Vérifier que le formulaire d'inscription est affiché
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
    expect(screen.getByText('Se connecter')).toBeInTheDocument();
  });

  it('submits login form with email and password', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(useAuth).mockReturnValue({
      signIn: mockSignIn,
      signUp: vi.fn(),
      loading: false,
      user: null,
    });

    renderAuth();
    
    // Remplir le formulaire
    const emailInput = screen.getByLabelText('Adresse email');
    const passwordInput = screen.getByLabelText('Mot de passe');
    const submitButton = screen.getByRole('button', { name: /se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Vérifier que signIn a été appelé avec les bonnes valeurs
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows loading state during form submission', async () => {
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn(() => new Promise(resolve => setTimeout(() => resolve({ error: null }), 1000))),
      signUp: vi.fn(),
      loading: true,
      user: null,
    });

    renderAuth();
    
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    // Vérifier que le bouton est en état de chargement
    expect(screen.getByRole('button', { name: /connexion.../i })).toBeInTheDocument();
  });

  it('shows error message when login fails', async () => {
    const errorMessage = 'Email ou mot de passe incorrect';
    vi.mocked(useAuth).mockReturnValue({
      signIn: vi.fn().mockResolvedValue({ error: { message: errorMessage } }),
      signUp: vi.fn(),
      loading: false,
      user: null,
    });

    renderAuth();
    
    // Soumettre le formulaire avec des champs vides pour déclencher la validation
    const submitButton = screen.getByRole('button', { name: /se connecter/i });
    fireEvent.click(submitButton);

    // Vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('persists auth mode in localStorage', async () => {
    renderAuth();
    
    // Basculer vers l'inscription
    const switchButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(switchButton);
    
    // Vérifier que localStorage.setItem a été appelé avec la bonne valeur
    expect(localStorage.setItem).toHaveBeenCalledWith('authMode', 'signup');
    
    // Simuler un re-render
    renderAuth();
    
    // Vérifier que le mode d'authentification est conservé
    expect(screen.getByText('Créer un compte')).toBeInTheDocument();
  });

  it('matches login form snapshot', () => {
    const { container } = renderAuth();
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches signup form snapshot', () => {
    const { container } = renderAuth();
    // Basculer vers l'inscription
    const switchButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(switchButton);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('has no accessibility violations in login form', async () => {
    const { container } = renderAuth();
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in signup form', async () => {
    const { container } = renderAuth();
    // Basculer vers l'inscription
    const switchButton = screen.getByRole('button', { name: /s'inscrire/i });
    fireEvent.click(switchButton);
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
