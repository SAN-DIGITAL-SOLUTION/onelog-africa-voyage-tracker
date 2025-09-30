import { render, screen } from '@testing-library/react';
import { StepIndicator } from '../StepIndicator';

describe('StepIndicator', () => {
  it('rend le bon nombre d\'étapes', () => {
    const steps = [
      { title: 'Étape 1', completed: true },
      { title: 'Étape 2', completed: false },
      { title: 'Étape 3', completed: false },
    ];
    render(<StepIndicator steps={steps} />);
    expect(screen.getAllByText(/Étape/)).toHaveLength(3);
  });

  it('applique la classe active à l\'étape courante', () => {
    const steps = [
      { title: 'A', completed: true },
      { title: 'B', completed: false },
    ];
    render(<StepIndicator steps={steps} />);
    // La première pastille doit avoir la classe bg-accentCTA
    const firstStep = screen.getByText('1');
    expect(firstStep.className).toMatch(/bg-accentCTA/);
    // La deuxième pastille doit avoir bg-gray-200
    const secondStep = screen.getByText('2');
    expect(secondStep.className).toMatch(/bg-gray-200/);
  });
});
