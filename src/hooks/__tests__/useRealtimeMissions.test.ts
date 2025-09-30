import { renderHook, act } from '@testing-library/react';
import { supabase } from '../../integrations/supabase/client';
import { useRealtimeMissions } from '../useRealtimeMissions';

// Mock Supabase
jest.mock('../../integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        in: jest.fn(() => ({
          order: jest.fn(() => ({
            data: [
              {
                id: '1',
                reference: 'TEST-001',
                status: 'in_progress',
                start_address: '123 Rue Test',
                end_address: '456 Rue Destination',
                start_lat: 6.3703,
                start_lng: 2.3912,
                end_lat: 6.4000,
                end_lng: 2.4000,
                client: { name: 'Client Test' },
                driver: { name: 'Chauffeur Test' },
                vehicle: { plate_number: 'AB-123-CD' },
                estimated_start_time: '2024-01-01T10:00:00Z',
                estimated_end_time: '2024-01-01T12:00:00Z',
                cargo_weight: 1000,
                cargo_volume: 50,
                priority: 'medium',
              },
            ],
            error: null,
          })),
        })),
      })),
    })),
    channel: jest.fn(() => ({
      on: jest.fn(() => ({
        subscribe: jest.fn(() => ({
          unsubscribe: jest.fn(),
        })),
      })),
    })),
  },
}));

describe('useRealtimeMissions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch missions on mount', async () => {
    const { result } = renderHook(() => useRealtimeMissions());

    expect(result.current.loading).toBe(true);
    expect(result.current.missions).toEqual([]);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.missions).toHaveLength(1);
    expect(result.current.missions[0].reference).toBe('TEST-001');
  });

  it('should handle realtime updates', async () => {
    const { result } = renderHook(() => useRealtimeMissions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simuler une mise à jour en temps réel
    const mockPayload = {
      eventType: 'UPDATE',
      new: {
        id: '1',
        reference: 'TEST-001-UPDATED',
        status: 'completed',
        start_address: '123 Rue Test',
        end_address: '456 Rue Destination',
        start_lat: 6.3703,
        start_lng: 2.3912,
        end_lat: 6.4000,
        end_lng: 2.4000,
        client: { name: 'Client Test' },
        driver: { name: 'Chauffeur Test' },
        vehicle: { plate_number: 'AB-123-CD' },
        estimated_start_time: '2024-01-01T10:00:00Z',
        estimated_end_time: '2024-01-01T12:00:00Z',
        cargo_weight: 1000,
        cargo_volume: 50,
        priority: 'medium',
      },
    };

    // Appeler le callback de mise à jour
    const mockChannel = (supabase.channel as jest.Mock).mock.results[0].value;
    const mockOn = mockChannel.on as jest.Mock;
    const updateCallback = mockOn.mock.calls[0][2];
    
    act(() => {
      updateCallback(mockPayload);
    });

    expect(result.current.missions[0].reference).toBe('TEST-001-UPDATED');
    expect(result.current.missions[0].status).toBe('completed');
  });

  it('should handle errors', async () => {
    const mockError = new Error('Network error');
    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        in: () => ({
          order: () => ({
            data: null,
            error: mockError,
          }),
        }),
      }),
    }));

    const { result } = renderHook(() => useRealtimeMissions());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Network error');
    expect(result.current.missions).toEqual([]);
  });

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn();
    const mockChannel = {
      on: jest.fn(() => ({ subscribe: jest.fn(() => ({ unsubscribe: mockUnsubscribe })) })),
    };
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);

    const { unmount } = renderHook(() => useRealtimeMissions());
    
    unmount();
    
    expect(mockUnsubscribe).toHaveBeenCalled();
  });
});
