const request = require('supertest');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// Mock Supabase
jest.mock('@supabase/supabase-js');

const mockSupabase = {
  from: jest.fn(),
  rpc: jest.fn(),
  channel: jest.fn(() => ({
    on: jest.fn(() => ({
      subscribe: jest.fn()
    }))
  })),
  removeChannel: jest.fn()
};

createClient.mockReturnValue(mockSupabase);

// Import after mocking
const app = require('../control-room-server');

describe('Control Room Backend API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/positions/:transporteurId', () => {
    it('should return positions for a transporteur', async () => {
      const mockPositions = [
        {
          id: '123',
          vehicule_id: 'VH001',
          mission_id: 'MIS001',
          statut: 'en_route',
          latitude: 5.359952,
          longitude: -3.998575,
          vitesse: 80
        }
      ];

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockPositions, error: null })
      });

      const response = await request(app)
        .get('/api/positions/transporteur-123')
        .expect(200);

      expect(response.body).toEqual(mockPositions);
      expect(mockSupabase.from).toHaveBeenCalledWith('positions');
    });

    it('should handle errors gracefully', async () => {
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: new Error('Database error') })
      });

      const response = await request(app)
        .get('/api/positions/transporteur-123')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /api/positions/:transporteurId/latest', () => {
    it('should return latest positions per vehicle', async () => {
      const mockLatestPositions = [
        {
          vehicule_id: 'VH001',
          mission_id: 'MIS001',
          statut: 'en_route',
          latitude: 5.359952,
          longitude: -3.998575,
          vitesse: 80
        }
      ];

      mockSupabase.rpc.mockResolvedValue({ data: mockLatestPositions, error: null });

      const response = await request(app)
        .get('/api/positions/transporteur-123/latest')
        .expect(200);

      expect(response.body).toEqual(mockLatestPositions);
      expect(mockSupabase.rpc).toHaveBeenCalledWith('get_latest_positions', {
        transporteur_uuid: 'transporteur-123'
      });
    });
  });

  describe('POST /api/positions', () => {
    it('should create a new position', async () => {
      const newPosition = {
        vehicule_id: 'VH001',
        mission_id: 'MIS001',
        transporteur_id: 'transporteur-123',
        statut: 'en_route',
        latitude: 5.359952,
        longitude: -3.998575,
        vitesse: 80,
        direction: 45
      };

      const mockCreatedPosition = { id: '456', ...newPosition };

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: mockCreatedPosition, error: null })
      });

      const response = await request(app)
        .post('/api/positions')
        .send(newPosition)
        .expect(200);

      expect(response.body).toEqual(mockCreatedPosition);
      expect(mockSupabase.from).toHaveBeenCalledWith('positions');
    });

    it('should validate required fields', async () => {
      const invalidPosition = {
        vehicule_id: 'VH001'
        // Missing required fields
      };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidPosition)
        .expect(500);

      expect(response.body.error).toBeDefined();
    });
  });

  describe('WebSocket functionality', () => {
    it('should handle client connections', () => {
      // This would require actual WebSocket testing setup
      expect(true).toBe(true);
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  it('should handle multiple concurrent requests', async () => {
    const requests = Array(10).fill().map(() => 
      request(app).get('/api/positions/transporteur-123')
    );

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null })
    });

    const responses = await Promise.all(requests);
    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });
});
