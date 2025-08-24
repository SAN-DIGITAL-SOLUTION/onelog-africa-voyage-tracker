import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineEvents } from '@/hooks/useTimelineEvents';
import { mockTimelineEvents } from '@/__tests__/mocks/timelineMocks';
import { vi } from 'vitest';

// Mock du service TimelineService
vi.mock('@/services/TimelineService', () => ({
  fetchTimelineData: vi.fn(),
  TimelineService: {
    groupEventsByDay: vi.fn(),
    filterEvents: vi.fn()
  }
}));

describe('useTimelineEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge les événements au montage du composant', async () => {
    const { fetchTimelineData } = await import('@/services/TimelineService');
    (fetchTimelineData as any).mockResolvedValue(mockTimelineEvents);

    const { result } = renderHook(() => useTimelineEvents('voyage-123'));

    // Vérifier l'état initial
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual(mockTimelineEvents);
    expect(fetchTimelineData).toHaveBeenCalledWith('voyage-123');
  });

  it('gère les erreurs de chargement', async () => {
    const { fetchTimelineData } = await import('@/services/TimelineService');
    const errorMessage = 'Erreur de réseau';
    (fetchTimelineData as any).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useTimelineEvents('voyage-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.events).toEqual([]);
  });

  it('applique les filtres correctement', async () => {
    const { fetchTimelineData, TimelineService } = await import('@/services/TimelineService');
    (fetchTimelineData as any).mockResolvedValue(mockTimelineEvents);
    (TimelineService.filterEvents as any).mockReturnValue(mockTimelineEvents.slice(0, 2));

    const { result } = renderHook(() => useTimelineEvents('voyage-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Appliquer des filtres
    const filters = { types: ['departure'], status: ['completed'] };
    result.current.applyFilters(filters);

    expect(TimelineService.filterEvents).toHaveBeenCalledWith(mockTimelineEvents, filters);
    expect(result.current.filteredEvents).toHaveLength(2);
  });

  it('recharge les données quand le voyageId change', async () => {
    const { fetchTimelineData } = await import('@/services/TimelineService');
    (fetchTimelineData as any).mockResolvedValue(mockTimelineEvents);

    const { result, rerender } = renderHook(
      ({ voyageId }) => useTimelineEvents(voyageId),
      { initialProps: { voyageId: 'voyage-123' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchTimelineData).toHaveBeenCalledWith('voyage-123');

    // Changer le voyageId
    rerender({ voyageId: 'voyage-456' });

    await waitFor(() => {
      expect(fetchTimelineData).toHaveBeenCalledWith('voyage-456');
    });

    expect(fetchTimelineData).toHaveBeenCalledTimes(2);
  });
});
