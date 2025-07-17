import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import SupervisionService, { supervisionService } from '../SupervisionService';
import { supabase } from '@/lib/supabase';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
    channel: vi.fn(),
    removeChannel: vi.fn(),
  },
}));

// Mock WebSocket
global.WebSocket = vi.fn().mockImplementation(() => ({
  close: vi.fn(),
  send: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}));

describe('SupervisionService', () => {
  let service: SupervisionService;
  let mockSupabaseFrom: any;
  let mockSupabaseChannel: any;

  beforeEach(() => {
    service = new SupervisionService();
    
    // Setup Supabase mocks
    mockSupabaseFrom = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
    };
    
    mockSupabaseChannel = {
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    };

    (supabase.from as any).mockReturnValue(mockSupabaseFrom);
    (supabase.channel as any).mockReturnValue(mockSupabaseChannel);
  });

  afterEach(() => {
    vi.clearAllMocks();
    service.cleanup();
  });

  describe('getPositions', () => {
    it('should fetch vehicle positions successfully', async () => {
      // Arrange
      const mockData = [
        {
          id: 'truck-001',
          name: 'Camion Test',
          lat: 14.6937,
          lng: -17.4441,
          status: 'active',
          mission: 'Test Mission',
          driver: 'Test Driver',
          zone: 'dakar',
          speed: 60,
          heading: 90,
          last_update: '2025-01-17T10:00:00Z',
        },
      ];

      mockSupabaseFrom.select.mockResolvedValue({
        data: mockData,
        error: null,
      });

      // Act
      const result = await service.getPositions();

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        id: 'truck-001',
        name: 'Camion Test',
        lat: 14.6937,
        lng: -17.4441,
        status: 'active',
        mission: 'Test Mission',
        driver: 'Test Driver',
        zone: 'dakar',
        speed: 60,
        heading: 90,
        lastUpdate: expect.any(String),
      });

      expect(supabase.from).toHaveBeenCalledWith('vehicle_positions');
      expect(mockSupabaseFrom.select).toHaveBeenCalled();
      expect(mockSupabaseFrom.order).toHaveBeenCalledWith('last_update', { ascending: false });
    });

    it('should handle API errors', async () => {
      // Arrange
      const mockError = { message: 'Database connection failed' };
      mockSupabaseFrom.select.mockResolvedValue({
        data: null,
        error: mockError,
      });

      // Act & Assert
      await expect(service.getPositions()).rejects.toThrow('Erreur API: Database connection failed');
    });

    it('should handle empty data', async () => {
      // Arrange
      mockSupabaseFrom.select.mockResolvedValue({
        data: null,
        error: null,
      });

      // Act
      const result = await service.getPositions();

      // Assert
      expect(result).toEqual([]);
    });
  });

  describe('connectRealtime', () => {
    it('should establish realtime connection', () => {
      // Arrange
      const mockCallback = vi.fn();
      const mockSubscribe = vi.fn();
      mockSupabaseChannel.subscribe.mockImplementation(mockSubscribe);

      // Act
      const cleanup = service.connectRealtime(mockCallback);

      // Assert
      expect(supabase.channel).toHaveBeenCalledWith('realtime/v1');
      expect(mockSupabaseChannel.on).toHaveBeenCalledWith(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicle_positions'
        },
        expect.any(Function)
      );
      expect(mockSupabaseChannel.subscribe).toHaveBeenCalled();
      expect(cleanup).toBeInstanceOf(Function);
    });

    it('should cleanup realtime connection', () => {
      // Arrange
      const mockCallback = vi.fn();
      const cleanup = service.connectRealtime(mockCallback);

      // Act
      cleanup();

      // Assert
      expect(supabase.removeChannel).toHaveBeenCalledWith(mockSupabaseChannel);
    });
  });

  describe('getMockPositions', () => {
    it('should return mock data for development', () => {
      // Act
      const result = service.getMockPositions();

      // Assert
      expect(result).toHaveLength(4);
      expect(result[0]).toEqual({
        id: 'truck-001',
        name: 'Camion Dakar-01',
        lat: 14.6937,
        lng: -17.4441,
        status: 'active',
        mission: 'Livraison Thiès',
        driver: 'Amadou Ba',
        zone: 'dakar',
        speed: 65,
        heading: 45,
        lastUpdate: expect.any(String),
      });
    });

    it('should include all required vehicle statuses', () => {
      // Act
      const result = service.getMockPositions();

      // Assert
      const statuses = result.map(p => p.status);
      expect(statuses).toContain('active');
      expect(statuses).toContain('idle');
      expect(statuses).toContain('maintenance');
    });
  });

  describe('filterPositions', () => {
    const mockPositions = [
      {
        id: '1',
        name: 'Truck 1',
        lat: 0,
        lng: 0,
        status: 'active' as const,
        driver: 'Driver A',
        zone: 'dakar',
        lastUpdate: '2025-01-17',
      },
      {
        id: '2',
        name: 'Truck 2',
        lat: 0,
        lng: 0,
        status: 'idle' as const,
        driver: 'Driver B',
        zone: 'thies',
        lastUpdate: '2025-01-17',
      },
    ];

    it('should filter by status', () => {
      // Act
      const result = service.filterPositions(mockPositions, {
        status: ['active'],
        zone: [],
        driver: [],
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('active');
    });

    it('should filter by zone', () => {
      // Act
      const result = service.filterPositions(mockPositions, {
        status: [],
        zone: ['dakar'],
        driver: [],
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].zone).toBe('dakar');
    });

    it('should filter by driver', () => {
      // Act
      const result = service.filterPositions(mockPositions, {
        status: [],
        zone: [],
        driver: ['Driver A'],
      });

      // Assert
      expect(result).toHaveLength(1);
      expect(result[0].driver).toBe('Driver A');
    });

    it('should return all positions when no filters applied', () => {
      // Act
      const result = service.filterPositions(mockPositions, {
        status: [],
        zone: [],
        driver: [],
      });

      // Assert
      expect(result).toHaveLength(2);
    });
  });

  describe('getFleetStats', () => {
    const mockPositions = [
      {
        id: '1',
        name: 'Truck 1',
        lat: 0,
        lng: 0,
        status: 'active' as const,
        speed: 60,
        lastUpdate: '2025-01-17',
      },
      {
        id: '2',
        name: 'Truck 2',
        lat: 0,
        lng: 0,
        status: 'idle' as const,
        speed: 0,
        lastUpdate: '2025-01-17',
      },
      {
        id: '3',
        name: 'Truck 3',
        lat: 0,
        lng: 0,
        status: 'maintenance' as const,
        speed: 0,
        lastUpdate: '2025-01-17',
      },
      {
        id: '4',
        name: 'Truck 4',
        lat: 0,
        lng: 0,
        status: 'active' as const,
        speed: 80,
        lastUpdate: '2025-01-17',
      },
    ];

    it('should calculate fleet statistics correctly', () => {
      // Act
      const result = service.getFleetStats(mockPositions);

      // Assert
      expect(result).toEqual({
        total: 4,
        active: 2,
        idle: 1,
        maintenance: 1,
        averageSpeed: 70, // (60 + 80) / 2
      });
    });

    it('should handle empty positions array', () => {
      // Act
      const result = service.getFleetStats([]);

      // Assert
      expect(result).toEqual({
        total: 0,
        active: 0,
        idle: 0,
        maintenance: 0,
        averageSpeed: 0,
      });
    });
  });

  describe('cleanup', () => {
    it('should cleanup WebSocket connection', () => {
      // Arrange
      const mockWs = {
        close: vi.fn(),
      };
      (service as any).wsConnection = mockWs;

      // Act
      service.cleanup();

      // Assert
      expect(mockWs.close).toHaveBeenCalled();
      expect((service as any).wsConnection).toBeNull();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(supervisionService).toBeInstanceOf(SupervisionService);
    });
  });
});
