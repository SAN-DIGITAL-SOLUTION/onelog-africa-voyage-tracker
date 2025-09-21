import { renderHook, waitFor } from '@testing-library/react';
import { useTimelineEvents } from '../../../src/hooks/useTimelineEvents';
import { mockTimelineEvents } from '../../mocks/timelineMocks';
import { vi } from 'vitest';

// Mock du service TimelineService basé sur la vraie signature
vi.mock('../../../src/services/TimelineService', () => ({
  timelineService: {
    getEvents: vi.fn(),
    getAvailableVehicles: vi.fn()
  }
}));

describe('useTimelineEvents', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('charge les événements au montage du composant', async () => {
    const { timelineService } = await import('../../../src/services/TimelineService');
    (timelineService.getEvents as any).mockResolvedValue(mockTimelineEvents);
    (timelineService.getAvailableVehicles as any).mockResolvedValue(['Vehicle1', 'Vehicle2']);

    const { result } = renderHook(() => useTimelineEvents());

    // Vérifier l'état initial
    expect(result.current.loading).toBe(true);
    expect(result.current.events).toEqual([]);

    // Attendre que les données soient chargées
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.events).toEqual(mockTimelineEvents);
    expect(result.current.availableVehicles).toEqual(['Vehicle1', 'Vehicle2']);
  });

  it('gère les erreurs de chargement', async () => {
    const { timelineService } = await import('../../../src/services/TimelineService');
    const errorMessage = 'Erreur de réseau';
    (timelineService.getEvents as any).mockRejectedValue(new Error(errorMessage));
    (timelineService.getAvailableVehicles as any).mockResolvedValue([]);

    const { result } = renderHook(() => useTimelineEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.events).toEqual([]);
  });

  it('peut recharger les données', async () => {
    const { timelineService } = await import('../../../src/services/TimelineService');
    (timelineService.getEvents as any).mockResolvedValue(mockTimelineEvents);
    (timelineService.getAvailableVehicles as any).mockResolvedValue(['Vehicle1']);

    const { result } = renderHook(() => useTimelineEvents());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Déclencher un refetch
    await result.current.refetch();

    expect(timelineService.getEvents).toHaveBeenCalledTimes(2);
    expect(timelineService.getAvailableVehicles).toHaveBeenCalledTimes(2);
  });
});
