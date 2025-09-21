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
    expect(screen.getByText(/Types d'événements/i)).toBeInTheDocument();
    expect(screen.getByText(/Statuts/i)).toBeInTheDocument();
    expect(screen.getByText(/Sévérité/i)).toBeInTheDocument();
    expect(screen.getByText(/Période/i)).toBeInTheDocument();
  });

  it('permet de désélectionner un type d`événement', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange}
        availableVehicles={mockAvailableVehicles}
      />
    );

    // 'departure' est déjà sélectionné, cliquer dessus devrait le retirer
    const departureFilter = screen.getByTestId('event-type-departure');
    fireEvent.click(departureFilter);

    expect(mockOnFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({
        eventTypes: ['arrival'] // 'departure' a été retiré
      })
    );
  });

  it('permet de réinitialiser tous les filtres', () => {
    render(
      <TimelineFilters 
        filters={mockTimelineFilters} 
        onFiltersChange={mockOnFiltersChange} 
        availableVehicles={mockAvailableVehicles}
      />
    );

    const resetButton = screen.getByTestId('filters-reset');
    fireEvent.click(resetButton, { bubbles: true });

    expect(mockOnFiltersChange).toHaveBeenCalledWith(expect.objectContaining({
      eventTypes: [],
      vehicleIds: [],
      statuses: [],
      severity: []
    }));
  });
});
