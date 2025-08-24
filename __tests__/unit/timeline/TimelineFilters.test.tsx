import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { TimelineFilters } from '../../../src/components/timeline/TimelineFilters';
import { TimelineFilters as TimelineFiltersType } from '../../../src/components/timeline/types';

describe('TimelineFilters', () => {
  const mockOnFiltersChange = vi.fn();
  const mockAvailableVehicles = ['CI-001', 'CI-002', 'CI-003'];
  
  const mockTimelineFilters: TimelineFiltersType = {
    dateRange: {
      start: new Date('2025-07-15'),
      end: new Date('2025-07-17')
    },
    eventTypes: ['departure', 'arrival'],
    vehicleIds: ['CI-001'],
    statuses: ['completed'],
    severity: ['low', 'medium']
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('affiche tous les filtres disponibles', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange}
        availableVehicles={mockAvailableVehicles}
      />
    );

    // Vérifier la présence des filtres principaux
    expect(screen.getByText(/Type d'événement/i)).toBeInTheDocument();
    expect(screen.getByText(/Statut/i)).toBeInTheDocument();
    expect(screen.getByText(/Gravité/i)).toBeInTheDocument();
    expect(screen.getByText(/Période/i)).toBeInTheDocument();
  });

  it('permet de sélectionner un type d\'événement', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange}
        availableVehicles={mockAvailableVehicles}
      />
    );

    // Cliquer sur le filtre "Départ"
    const departureFilter = screen.getByLabelText(/Départ/i);
    fireEvent.click(departureFilter);

    // Vérifier que la callback est appelée
    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        types: expect.arrayContaining(['departure'])
      })
    );
  });

  it('permet de réinitialiser tous les filtres', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange} 
      />
    );

    // Cliquer sur le bouton de réinitialisation
    const resetButton = screen.getByText(/Réinitialiser/i);
    fireEvent.click(resetButton);

    // Vérifier que tous les filtres sont réinitialisés
    expect(mockOnFiltersChange).toHaveBeenCalledWith({
      dateRange: { start: null, end: null },
      types: [],
      status: [],
      severity: [],
      vehicleId: null
    });
  });

  it('affiche le nombre d\'événements filtrés', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange}
        eventCount={42}
      />
    );

    expect(screen.getByText(/42 événements/i)).toBeInTheDocument();
  });
});
