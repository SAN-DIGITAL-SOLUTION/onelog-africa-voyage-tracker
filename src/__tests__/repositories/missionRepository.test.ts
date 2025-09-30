/**
 * Tests unitaires pour MissionRepository
 * 
 * Teste toutes les méthodes CRUD avec mocks Supabase
 * Couvre les cas de succès et d'erreur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MissionRepository } from '@/repositories/missionRepository';
import type { Mission, MissionStatus } from '@/types/mission';

// Mock du client Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '@/integrations/supabase/client';

describe('MissionRepository', () => {
  let repository: MissionRepository;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockOrder: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new MissionRepository();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSingle = vi.fn();
    mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect }));
    mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle }));
    mockOrder = vi.fn(() => ({ eq: mockEq, select: mockSelect }));
    mockInsert = vi.fn(() => ({ select: mockSelect }));
    mockUpdate = vi.fn(() => ({ eq: mockEq }));
    mockDelete = vi.fn(() => ({ eq: mockEq }));
    mockFrom = vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
      eq: mockEq,
      order: mockOrder
    }));
    
    (supabase.from as ReturnType<typeof vi.fn>) = mockFrom;
  });

  describe('findById', () => {
    it('devrait retourner une mission existante', async () => {
      const mockMission: Mission = {
        id: '123',
        ref: 'M-001',
        title: 'Test Mission',
        client: 'Client A',
        status: 'draft',
        priority: 'medium',
        user_id: 'user-123'
      };

      mockSingle.mockResolvedValue({ data: mockMission, error: null });

      const result = await repository.findById('123');

      expect(result).toEqual(mockMission);
      expect(mockFrom).toHaveBeenCalledWith('missions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
    });

    it('devrait retourner null si mission non trouvée', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' } 
      });

      const result = await repository.findById('999');

      expect(result).toBeNull();
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST500', message: 'Database error' } 
      });

      await expect(repository.findById('123')).rejects.toThrow('Erreur lors de la récupération de la mission');
    });
  });

  describe('findAll', () => {
    it('devrait retourner toutes les missions sans filtre', async () => {
      const mockMissions: Mission[] = [
        {
          id: '1',
          ref: 'M-001',
          title: 'Mission 1',
          client: 'Client A',
          status: 'draft',
          priority: 'medium',
          user_id: 'user-1'
        },
        {
          id: '2',
          ref: 'M-002',
          title: 'Mission 2',
          client: 'Client B',
          status: 'published',
          priority: 'high',
          user_id: 'user-2'
        }
      ];

      mockOrder.mockReturnValue({
        ...mockOrder(),
        then: (resolve: (value: { data: Mission[]; error: null }) => void) => 
          resolve({ data: mockMissions, error: null })
      });

      const result = await repository.findAll();

      expect(result).toEqual(mockMissions);
      expect(mockFrom).toHaveBeenCalledWith('missions');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('devrait appliquer les filtres correctement', async () => {
      const mockFilteredMissions: Mission[] = [
        {
          id: '1',
          ref: 'M-001',
          title: 'Mission 1',
          client: 'Client A',
          status: 'draft',
          priority: 'high',
          user_id: 'user-1'
        }
      ];

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        then: (resolve: (value: { data: Mission[]; error: null }) => void) => 
          resolve({ data: mockFilteredMissions, error: null })
      };

      mockOrder.mockReturnValue(mockQuery);

      const result = await repository.findAll({
        status: 'draft',
        priority: 'high',
        client: 'Client A'
      });

      expect(result).toEqual(mockFilteredMissions);
      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'draft');
      expect(mockQuery.eq).toHaveBeenCalledWith('priority', 'high');
      expect(mockQuery.eq).toHaveBeenCalledWith('client', 'Client A');
    });

    it('devrait retourner un tableau vide si aucune mission', async () => {
      mockOrder.mockReturnValue({
        then: (resolve: (value: { data: null; error: null }) => void) => 
          resolve({ data: null, error: null })
      });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockOrder.mockReturnValue({
        then: (resolve: (value: { data: null; error: { message: string } }) => void) => 
          resolve({ data: null, error: { message: 'Database error' } })
      });

      await expect(repository.findAll()).rejects.toThrow('Erreur lors de la récupération des missions');
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle mission', async () => {
      const newMission: Omit<Mission, 'id'> = {
        ref: 'M-003',
        title: 'New Mission',
        client: 'Client C',
        status: 'draft',
        priority: 'medium',
        user_id: 'user-3'
      };

      const createdMission: Mission = {
        id: '3',
        ...newMission
      };

      mockSingle.mockResolvedValue({ data: createdMission, error: null });

      const result = await repository.create(newMission);

      expect(result).toEqual(createdMission);
      expect(mockFrom).toHaveBeenCalledWith('missions');
      expect(mockInsert).toHaveBeenCalledWith([newMission]);
    });

    it('devrait lancer une erreur si création échoue', async () => {
      const newMission: Omit<Mission, 'id'> = {
        ref: 'M-003',
        title: 'New Mission',
        client: 'Client C',
        status: 'draft',
        priority: 'medium',
        user_id: 'user-3'
      };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Constraint violation' } 
      });

      await expect(repository.create(newMission)).rejects.toThrow('Erreur lors de la création de la mission');
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une mission existante', async () => {
      const updates: Partial<Mission> = {
        title: 'Updated Title',
        status: 'published'
      };

      const updatedMission: Mission = {
        id: '1',
        ref: 'M-001',
        title: 'Updated Title',
        client: 'Client A',
        status: 'published',
        priority: 'medium',
        user_id: 'user-1'
      };

      mockSingle.mockResolvedValue({ data: updatedMission, error: null });

      const result = await repository.update('1', updates);

      expect(result).toEqual(updatedMission);
      expect(mockFrom).toHaveBeenCalledWith('missions');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('devrait lancer une erreur si mise à jour échoue', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Update failed' } 
      });

      await expect(repository.update('1', { title: 'Test' })).rejects.toThrow('Erreur lors de la mise à jour de la mission');
    });
  });

  describe('delete', () => {
    it('devrait supprimer une mission', async () => {
      mockEq.mockResolvedValue({ error: null });

      await repository.delete('1');

      expect(mockFrom).toHaveBeenCalledWith('missions');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('devrait lancer une erreur si suppression échoue', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(repository.delete('1')).rejects.toThrow('Erreur lors de la suppression de la mission');
    });
  });

  describe('changeStatus', () => {
    it('devrait changer le statut d\'une mission', async () => {
      const newStatus: MissionStatus = 'ongoing';
      const updatedMission: Mission = {
        id: '1',
        ref: 'M-001',
        title: 'Mission 1',
        client: 'Client A',
        status: newStatus,
        priority: 'medium',
        user_id: 'user-1'
      };

      mockSingle.mockResolvedValue({ data: updatedMission, error: null });

      const result = await repository.changeStatus('1', newStatus);

      expect(result).toEqual(updatedMission);
      expect(mockUpdate).toHaveBeenCalledWith({ status: newStatus });
      expect(mockEq).toHaveBeenCalledWith('id', '1');
    });

    it('devrait lancer une erreur si changement de statut échoue', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Status change failed' } 
      });

      await expect(repository.changeStatus('1', 'ongoing')).rejects.toThrow('Erreur lors du changement de statut de la mission');
    });
  });
});
