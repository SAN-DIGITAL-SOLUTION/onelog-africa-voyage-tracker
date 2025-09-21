import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { EventItem } from '../../../src/components/timeline/EventItem';
import { TimelineEvent } from '../../../src/components/timeline/types';

describe('EventItem', () => {
  const mockEvent: TimelineEvent = {
    id: '1',
    timestamp: new Date('2025-07-15T10:30:00'),
    type: 'departure',
    title: 'Départ de l\'entrepôt principal',
    description: 'Chargement des marchandises terminé',
    vehicleId: 'VAN-001',
    driverId: 'DRV-123',
    location: {
      lat: 5.3600,
      lng: -4.0083,
      address: 'Entrepôt Principal, Abidjan'
    },
    status: 'completed',
    severity: 'low'
  };

  it('affiche correctement les informations de l\'événement', () => {
    render(<EventItem event={mockEvent} />);
    
    // Vérification des éléments clés
    expect(screen.getByText(/Départ de l'entrepôt principal/i)).toBeInTheDocument();
    expect(screen.getByText(/10:30/)).toBeInTheDocument();
    expect(screen.getByText(/VAN-001/)).toBeInTheDocument();
    expect(screen.getByText(/Entrepôt Principal, Abidjan/)).toBeInTheDocument();
  });

  it('affiche l\'icône correspondante au type d\'événement', () => {
    render(<EventItem event={mockEvent} />);
    // Vérifie la présence de l'icône de départ (utilisation d'un test-id)
    expect(screen.getByTestId('event-icon')).toBeInTheDocument();
  });

  it('affiche le badge de statut avec la bonne couleur', () => {
    render(<EventItem event={mockEvent} />);
    const badge = screen.getByText(/completed/i);
    expect(badge).toHaveClass('bg-[#009688]', 'text-white');
  });
});
