import React from 'react';

type Step = { title: string; completed: boolean };

export function StepIndicator({ steps }: { steps: Step[] }) {
  return (
    <nav aria-label="Progress">
      <ol className="flex space-x-4">
        {steps.map((step, idx) => (
          <li key={idx} className="flex items-center">
            <span
              className={`px-2 py-1 rounded-full ${
                step.completed ? 'bg-accentCTA text-white' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {idx + 1}
            </span>
            <span className="ml-2">{step.title}</span>
          </li>
        ))}
      </ol>
    </nav>
  );
}
