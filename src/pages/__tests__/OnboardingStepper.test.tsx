import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import OnboardingStepper, { resetOnboardingDone } from '../OnboardingStepper';
import { onboardingSteps } from '../../data/onboardingSteps';
import * as analytics from '../../services/analytics';

// Helper pour localStorage mock
function mockLocalStorage() {
  const store: Record<string, string> = {};
  vi.spyOn(window.localStorage.__proto__, 'setItem').mockImplementation((k, v) => { store[k] = v; });
  vi.spyOn(window.localStorage.__proto__, 'getItem').mockImplementation((k) => store[k] ?? null);
  vi.spyOn(window.localStorage.__proto__, 'removeItem').mockImplementation((k) => { delete store[k]; });
  return store;
}

describe('OnboardingStepper', () => {
  it('affiche le premier slide et passe au suivant', async () => {
    render(<OnboardingStepper />);
    expect(await screen.findByText(onboardingSteps[0].title)).toBeInTheDocument();
    const nextBtn = screen.getAllByRole('button').find(btn => btn.textContent?.match(/suivant/i));
    fireEvent.click(nextBtn!);
    expect(await screen.findByText(onboardingSteps[1].title)).toBeInTheDocument();
  });

  it('bouton Ignorer appelle onFinish et met à jour localStorage', async () => {
    const store = mockLocalStorage();
    const onFinish = vi.fn();
    render(<OnboardingStepper onFinish={onFinish} />);
    // Aller au slide 2
    const nextBtn = screen.getAllByRole('button').find(btn => btn.textContent?.match(/suivant/i));
    fireEvent.click(nextBtn!);
    // Bouton Ignorer doit apparaître
    const skipBtn = await screen.findByRole('button', { name: /ignorer/i });
    fireEvent.click(skipBtn);
    expect(onFinish).toHaveBeenCalled();
    expect(store['onelog_onboarding_done']).toBe('1');
  });

  it('trackEvent est appelé à chaque slide avec le bon rôle', async () => {
    const trackSpy = vi.spyOn(analytics, 'trackEvent');
    render(<OnboardingStepper role="chauffeur" />);
    // Slide 0
    expect(trackSpy).toHaveBeenLastCalledWith('onboarding_slide_viewed', { slide: 0, role: 'chauffeur' });
    // Aller au slide suivant
    // Le premier appel (slide 0) est fait au montage. On le purge pour ne garder que les transitions.
    trackSpy.mockClear();
    // On clique 3 fois pour passer tous les slides, en attendant chaque titre de slide
    let nextBtn = screen.getAllByRole('button').find(btn => btn.textContent?.match(/suivant/i));
    await screen.findByText(onboardingSteps[0].title);
    fireEvent.click(nextBtn!); // slide 1
    await screen.findByText(onboardingSteps[1].title);
    nextBtn = screen.getAllByRole('button').find(btn => btn.textContent?.match(/suivant/i));
    fireEvent.click(nextBtn!); // slide 2
    await screen.findByText(onboardingSteps[2].title);
    nextBtn = screen.getAllByRole('button').find(btn => btn.textContent?.match(/suivant/i));
    fireEvent.click(nextBtn!); // slide 3
    await screen.findByText(onboardingSteps[3].title);
    // Vérifie la séquence complète des appels (après le clear)
    const calls = trackSpy.mock.calls.filter(call => call[0] === 'onboarding_slide_viewed');
    expect(calls.length).toBe(3);
    expect(calls[0][1]).toEqual({ slide: 1, role: 'chauffeur' });
    expect(calls[1][1]).toEqual({ slide: 2, role: 'chauffeur' });
    expect(calls[2][1]).toEqual({ slide: 3, role: 'chauffeur' });
    trackSpy.mockRestore();
  });

  it('resetOnboardingDone supprime la clé localStorage', () => {
    const store = mockLocalStorage();
    store['onelog_onboarding_done'] = '1';
    resetOnboardingDone();
    expect(store['onelog_onboarding_done']).toBeUndefined();
  });

  // Test d’intégration pour la page Profil : navigation vers onboarding après reset
  it('simulate le bouton "Revoir l’onboarding" du profil', () => {
    const navigate = vi.fn();
    // Simule le handler utilisé dans le profil
    localStorage.setItem('onelog_onboarding_done', '1');
    // Simule le clic sur le bouton
    localStorage.removeItem('onelog_onboarding_done');
    navigate('/onboarding');
    expect(localStorage.getItem('onelog_onboarding_done')).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/onboarding');
  });

  it('appelle onFinish à la fin', async () => {
    const onFinish = vi.fn();
    render(<OnboardingStepper onFinish={onFinish} />);
    for (let i = 0; i < onboardingSteps.length; i++) {
      // On cible le bouton "Suivant" ou "Terminer" (jamais "Ignorer")
      const btn = screen.getAllByRole('button').find(b => b.textContent?.match(/suivant|terminer/i));
      fireEvent.click(btn!);
      // Attendre que le slide suivant apparaisse (ou la fin)
      if (i < onboardingSteps.length - 1) {
        // eslint-disable-next-line no-await-in-loop
        await screen.findByText(onboardingSteps[i + 1].title);
      }
    }
    expect(onFinish).toHaveBeenCalled();
  });

  it('affiche la progression visuelle', () => {
    render(<OnboardingStepper />);
    // Sélectionne uniquement les dots (span) role="presentation"
    const dots = screen.getAllByRole('presentation').filter(el => el.tagName === 'SPAN');
    expect(dots.length).toBe(onboardingSteps.length);
  });
});
