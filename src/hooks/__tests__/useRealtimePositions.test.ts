import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRealtimePositions } from '../useRealtimePositions';
import { supervisionService } from '@/services/SupervisionService';

// Mock SupervisionService
vi.mock('@/services/SupervisionService', () => ({
  supervisionService: {
    getPositions: vi.fn(),
    getMockPositions: vi.fn(),
    connectRealtime: vi.fn(),
  },
}));

// Mock process.env
const mockEnv = vi.hoisted(() => ({
  NODE_ENV: 'test',
}));

vi.mock('process', () => ({
  env: mockEnv,
}));

describe('useRealtimePositions', () => {
  const mockPositions = [
    {
      id: 'truck-001',
      name: 'Camion Test',
      lat: 14.6937,
      lng: -17.4441,
      status: 'active' as const,
      mission: 'Test Mission',
      driver: 'Test Driver',
      zone: 'dakar',
      speed: 60,
      heading: 90,
      lastUpdate: '2025-01-17 10:00:00',
    },
    {
      id: 'truck-002',
      name: 'Camion Test 2',
      lat: 14.7886,
      lng: -16.9268,
      status: 'idle' as const,
      mission: 'En attente',
      driver: 'Test Driver 2',
      zone: 'thies',
      speed: 0,
      heading: 0,
      lastUpdate: '2025-01-17 09:55:00',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial loading', () => {
    it('should start with loading state', () => {
      // Arrange
      (supervisionService.getPositions as any).mockImplementation(() => new Promise(() => {}));

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Assert
      expect(result.current.loading).toBe(true);
      expect(result.current.positions).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.connectionStatus).toBe('connecting');
    });

    it('should load positions successfully in production', async () => {
      // Arrange
      mockEnv.NODE_ENV = 'production';
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(() => {});

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.positions).toEqual(mockPositions);
      expect(result.current.error).toBeNull();
      expect(result.current.connectionStatus).toBe('connected');
      expect(supervisionService.getPositions).toHaveBeenCalled();
    });

    it('should use mock data in development', async () => {
      // Arrange
      mockEnv.NODE_ENV = 'development';
      (supervisionService.getMockPositions as any).mockReturnValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(() => {});

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Simulate the timeout for mock data
      vi.advanceTimersByTime(1000);

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.positions).toEqual(mockPositions);
      expect(result.current.connectionStatus).toBe('connected');
      expect(supervisionService.getMockPositions).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle API errors', async () => {
      // Arrange
      const errorMessage = 'API Error';
      (supervisionService.getPositions as any).mockRejectedValue(new Error(errorMessage));

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Assert
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.connectionStatus).toBe('disconnected');
      expect(result.current.positions).toEqual([]);
    });

    it('should retry connection after error', async () => {
      // Arrange
      (supervisionService.getPositions as any)
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValueOnce(mockPositions);

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Wait for initial error
      await waitFor(() => {
        expect(result.current.error).toBe('Connection failed');
      });

      // Advance timer to trigger retry
      vi.advanceTimersByTime(10000);

      // Assert
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });

      expect(result.current.positions).toEqual(mockPositions);
      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  describe('realtime connection', () => {
    it('should establish realtime connection', async () => {
      // Arrange
      const mockCleanup = vi.fn();
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(mockCleanup);

      // Act
      const { result, unmount } = renderHook(() => useRealtimePositions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Assert
      expect(supervisionService.connectRealtime).toHaveBeenCalled();

      // Test cleanup
      unmount();
      expect(mockCleanup).toHaveBeenCalled();
    });

    it('should handle realtime updates', async () => {
      // Arrange
      let realtimeCallback: (positions: any[]) => void;
      const mockCleanup = vi.fn();
      
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockImplementation((callback) => {
        realtimeCallback = callback;
        return mockCleanup;
      });

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Simulate realtime update
      const updatedPositions = [
        { ...mockPositions[0], status: 'idle' as const },
        mockPositions[1],
      ];
      realtimeCallback!(updatedPositions);

      // Assert
      await waitFor(() => {
        expect(result.current.positions).toEqual(updatedPositions);
      });
      expect(result.current.connectionStatus).toBe('connected');
    });
  });

  describe('development mode simulation', () => {
    it('should simulate position updates in development', async () => {
      // Arrange
      mockEnv.NODE_ENV = 'development';
      (supervisionService.getMockPositions as any).mockReturnValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(() => {});

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Wait for initial load
      vi.advanceTimersByTime(1000);
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const initialPositions = result.current.positions;

      // Advance timer to trigger simulation update
      vi.advanceTimersByTime(5000);

      // Assert
      await waitFor(() => {
        // Positions should be updated (at least timestamps)
        expect(result.current.positions).not.toEqual(initialPositions);
      });
    });
  });

  describe('refetch functionality', () => {
    it('should refetch positions when called', async () => {
      // Arrange
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(() => {});

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Clear previous calls
      vi.clearAllMocks();
      (supervisionService.getPositions as any).mockResolvedValue([mockPositions[0]]);

      // Refetch
      await result.current.refetch();

      // Assert
      expect(supervisionService.getPositions).toHaveBeenCalled();
      expect(result.current.positions).toEqual([mockPositions[0]]);
    });
  });

  describe('cleanup', () => {
    it('should cleanup connections on unmount', async () => {
      // Arrange
      const mockCleanup = vi.fn();
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(mockCleanup);

      // Act
      const { unmount } = renderHook(() => useRealtimePositions());

      // Wait for connection to be established
      await waitFor(() => {
        expect(supervisionService.connectRealtime).toHaveBeenCalled();
      });

      // Unmount
      unmount();

      // Assert
      expect(mockCleanup).toHaveBeenCalled();
    });
  });

  describe('connection status', () => {
    it('should track connection status correctly', async () => {
      // Arrange
      (supervisionService.getPositions as any).mockResolvedValue(mockPositions);
      (supervisionService.connectRealtime as any).mockReturnValue(() => {});

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Assert initial state
      expect(result.current.connectionStatus).toBe('connecting');

      // Wait for connection
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('connected');
      });
    });

    it('should set disconnected status on error', async () => {
      // Arrange
      (supervisionService.getPositions as any).mockRejectedValue(new Error('Connection failed'));

      // Act
      const { result } = renderHook(() => useRealtimePositions());

      // Assert
      await waitFor(() => {
        expect(result.current.connectionStatus).toBe('disconnected');
      });
    });
  });
});
