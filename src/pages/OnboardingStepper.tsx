// fichier : src/pages/OnboardingStepper.tsx
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui-system';
import { onboardingSteps } from '../data/onboardingSteps';
import { trackEvent } from '@/services/analytics';
import { StepIndicator } from '@/components/StepIndicator';

export function resetOnboardingDone() {
  localStorage.removeItem('onelog_onboarding_done');
}

type OnboardingStepperProps = {
  onFinish?: () => void;
  role?: string | null;
};

export default function OnboardingStepper({ onFinish, role }: OnboardingStepperProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    trackEvent('onboarding_slide_viewed', { slide: step, role });
  }, [step, role]);

  const next = () => {
    if (step < onboardingSteps.length - 1) setStep(step + 1);
    else {
      localStorage.setItem('onelog_onboarding_done', '1');
      trackEvent('onboarding_finished', { skipped: false, role });
      if (onFinish) onFinish();
    }
  };

  const handleSkip = () => {
    localStorage.setItem('onelog_onboarding_done', '1');
    trackEvent('onboarding_finished', { skipped: true, role });
    if (onFinish) onFinish();
  };

  // Personnalisation du slide 2 selon le rôle
  const getStepContent = (stepIdx: number) => {
    if (stepIdx === 1 && role) {
      if (role === 'chauffeur') {
        return {
          ...onboardingSteps[1],
          description: 'En tant que chauffeur, consultez vos missions et démarrez-les facilement.',
          image: '/assets/onboarding/step2-chauffeur.svg',
        };
      }
      if (role === 'exploiteur') {
        return {
          ...onboardingSteps[1],
          description: 'En tant qu\'exploiteur, planifiez les trajets et assignez vos chauffeurs en un clic.',
          image: '/assets/onboarding/step2-exploiteur.svg',
        };
      }
    }
    return onboardingSteps[stepIdx];
  };

  const stepContent = getStepContent(step);

  return (
    <div className="bg-[#F4F4F4] min-h-screen flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-2xl shadow-lg p-8 relative">
        {/* Bouton Ignorer */}
        {step > 0 && (
          <button
            className="absolute top-4 right-4 text-sm text-gray-400 hover:text-[#E65100] underline"
            style={{ zIndex: 10 }}
            onClick={handleSkip}
            aria-label="Ignorer l’onboarding"
          >
            Ignorer
          </button>
        )}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-[#1A3C40] text-xl font-semibold mb-2">
              {stepContent.title}
            </div>
            <p className="text-[#263238] mb-4">{stepContent.description}</p>
            <img
              src={stepContent.image}
              alt={stepContent.title || 'Illustration étape onboarding'}
              className="w-full h-48 object-contain mb-6 rounded-xl border border-gray-200 bg-gray-50"
              onError={e => {
                (e.target as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            <div className="flex justify-end">
              <Button
                variant="primary"
                className="bg-[#E65100] hover:bg-[#bf360c] text-white text-lg px-8 py-3 rounded-full shadow-lg focus:outline-none focus:ring-4 focus:ring-[#F9A825]/60 transition-all duration-150"
                style={{ minWidth: 120 }}
                onClick={next}
              >
                {step === onboardingSteps.length - 1 ? 'Terminer' : 'Suivant'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* Progression visuelle */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
          <StepIndicator
            steps={onboardingSteps.map((s, i) => ({
              title: s.title,
              completed: i < step
            }))}
          />
        </div>
      </div>
    </div>
  );
}
