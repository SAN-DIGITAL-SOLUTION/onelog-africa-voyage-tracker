import { renderHook, act } from '@testing-library/react';
import { supabase } from '../../integrations/supabase/client';
import { useRealtimeVehicles } from '../useRealtimeVehicles';

jest.mock('../../integrations/supabase/client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          data: [
            {
              id: '1',
              vehicle_id: 'veh-001',
              latitude: 6.3703,
              longitude: 2.3912,
              speed: 60,
              heading: 90,
              timestamp: '2024-01-01T10:00:00Z',
              vehicle: {
                plate_number: 'AB-123-CD',
                driver: { name: 'Chauffeur Test' },
              },
            },
          ],
          error: null,
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

describe('useRealtimeVehicles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch vehicles on mount', async () => {
    const { result } = renderHook(() => useRealtimeVehicles());

    expect(result.current.loading).toBe(true);
    expect(result.current.vehicles).toEqual([]);

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.vehicles[0].vehicle_plate).toBe('AB-123-CD');
  });

  it('should handle realtime updates', async () => {
    const { result } = renderHook(() => useRealtimeVehicles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    // Simuler une nouvelle position
    const mockPayload = {
      eventType: 'INSERT',
      new: {
        id: '2',
        vehicle_id: 'veh-001',
        latitude: 6.3800,
        longitude: 2.4000,
        speed: 65,
        heading: 95,
        timestamp: '2024-01-01T10:05:00Z',
        vehicle: {
          plate_number: 'AB-123-CD',
          driver: { name: 'Chauffeur Test' },
        },
      },
    };

    const mockChannel = (supabase.channel as jest.Mock).mock.results[0].value;
    const mockOn = mockChannel.on as jest.Mock;
    const updateCallback = mockOn.mock.calls[0][2];
    
    act(() => {
      updateCallback(mockPayload);
    });

    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.vehicles[0].latitude).toBe(6.3800);
    expect(result.current.vehicles[0].speed).toBe(65);
  });

  it('should deduplicate vehicles by keeping latest position', async () => {
    const mockData = [
      {
        id: '1',
        vehicle_id: 'veh-001',
        latitude: 6.3703,
        longitude: 2.3912,
        speed: 60,
        heading: 90,
        timestamp: '2024-01-01T09:00:00Z',
        vehicle: {
          plate_number: 'AB-123-CD',
          driver: { name: 'Chauffeur Test' },
        },
      },
      {
        id: '2',
        vehicle_id: 'veh-001',
        latitude: 6.3800,
        longitude: 2.4000,
        speed: 65,
        heading: 95,
        timestamp: '2024-01-01T10:00:00Z',
        vehicle: {
          plate_number: 'AB-123-CD',
          driver: { name: 'Chauffeur Test' },
        },
      },
    ];

    (supabase.from as jest.Mock).mockImplementation(() => ({
      select: () => ({
        order: () => ({
          data: mockData,
          error: null,
        }),
      }),
    }));

    const { result } = renderHook(() => useRealtimeVehicles());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.vehicles).toHaveLength(1);
    expect(result.current.vehicles[0].latitude).toBe(6.3800); // Latest position
  });
});
