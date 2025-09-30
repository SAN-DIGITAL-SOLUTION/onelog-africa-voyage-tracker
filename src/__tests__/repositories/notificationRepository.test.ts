/**
 * Tests unitaires pour NotificationRepository
 * 
 * Teste toutes les méthodes avec mocks Supabase
 * Couvre les cas de succès et d'erreur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationRepository } from '@/repositories/notificationRepository';
import type { Notification, NotificationFilters } from '@/types/notifications';
import type { CreateNotificationData } from '@/repositories/notificationRepository';

// Mock du client Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '@/integrations/supabase/client';

describe('NotificationRepository', () => {
  let repository: NotificationRepository;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockOrder: ReturnType<typeof vi.fn>;
  let mockLimit: ReturnType<typeof vi.fn>;
  let mockRange: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new NotificationRepository();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSingle = vi.fn();
    mockRange = vi.fn(() => ({ then: vi.fn() }));
    mockLimit = vi.fn(() => ({ range: mockRange, then: vi.fn() }));
    mockEq = vi.fn(() => ({ 
      eq: mockEq, 
      limit: mockLimit, 
      range: mockRange,
      then: vi.fn(),
      single: mockSingle
    }));
    mockOrder = vi.fn(() => ({ 
      eq: mockEq, 
      limit: mockLimit,
      then: vi.fn()
    }));
    mockSelect = vi.fn(() => ({ 
      eq: mockEq, 
      order: mockOrder,
      single: mockSingle
    }));
    mockInsert = vi.fn(() => ({ select: mockSelect }));
    mockUpdate = vi.fn(() => ({ eq: mockEq }));
    mockFrom = vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      eq: mockEq,
      order: mockOrder
    }));
    
    (supabase.from as ReturnType<typeof vi.fn>) = mockFrom;
  });

  describe('findByUserId', () => {
    it('devrait retourner les notifications d\'un utilisateur', async () => {
      const mockNotifications: Notification[] = [
        {
          id: 'notif-1',
          title: 'Test Notification',
          message: 'Test message',
          type: 'mission_completed',
          priority: 'medium',
          channel: 'in_app',
          user_id: 'user-123',
          status: 'pending',
          scheduled_at: '2025-01-01T00:00:00Z',
          retry_count: 0,
          created_at: '2025-01-01T00:00:00Z',
          updated_at: '2025-01-01T00:00:00Z'
        }
      ];

      mockOrder.mockResolvedValue({ data: mockNotifications, error: null });

      const result = await repository.findByUserId('user-123');

      expect(result).toEqual(mockNotifications);
      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('devrait appliquer les filtres correctement', async () => {
      const filters: NotificationFilters = {
        status: 'pending',
        type: 'mission_completed',
        limit: 10
      };

      const mockQuery = {
        eq: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [], error: null })
      };

      mockOrder.mockReturnValue(mockQuery);

      await repository.findByUserId('user-123', filters);

      expect(mockQuery.eq).toHaveBeenCalledWith('status', 'pending');
      expect(mockQuery.eq).toHaveBeenCalledWith('type', 'mission_completed');
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
    });

    it('devrait retourner un tableau vide si aucune notification', async () => {
      mockOrder.mockResolvedValue({ data: null, error: null });

      const result = await repository.findByUserId('user-123');

      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockOrder.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(repository.findByUserId('user-123')).rejects.toThrow('Erreur lors de la récupération des notifications');
    });
  });

  describe('getUnreadCount', () => {
    it('devrait retourner le nombre de notifications non lues', async () => {
      mockEq.mockResolvedValue({ count: 5, error: null });

      const result = await repository.getUnreadCount('user-123');

      expect(result).toBe(5);
      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockSelect).toHaveBeenCalledWith('*', { count: 'exact', head: true });
      expect(mockEq).toHaveBeenCalledWith('user_id', 'user-123');
      expect(mockEq).toHaveBeenCalledWith('status', 'pending');
    });

    it('devrait retourner 0 si aucune notification non lue', async () => {
      mockEq.mockResolvedValue({ count: null, error: null });

      const result = await repository.getUnreadCount('user-123');

      expect(result).toBe(0);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockEq.mockResolvedValue({ 
        count: null, 
        error: { message: 'Database error' } 
      });

      await expect(repository.getUnreadCount('user-123')).rejects.toThrow('Erreur lors du comptage des notifications non lues');
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle notification', async () => {
      const newNotification: CreateNotificationData = {
        title: 'New Notification',
        message: 'New message',
        type: 'mission_completed',
        priority: 'high',
        channel: 'in_app',
        user_id: 'user-123',
        status: 'pending',
        scheduled_at: '2025-01-01T00:00:00Z',
        retry_count: 0
      };

      const createdNotification: Notification = {
        id: 'notif-new',
        ...newNotification,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: createdNotification, error: null });

      const result = await repository.create(newNotification);

      expect(result).toEqual(createdNotification);
      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockInsert).toHaveBeenCalledWith([newNotification]);
    });

    it('devrait lancer une erreur si création échoue', async () => {
      const newNotification: CreateNotificationData = {
        title: 'New Notification',
        message: 'New message',
        type: 'mission_completed',
        priority: 'high',
        channel: 'in_app',
        status: 'pending',
        scheduled_at: '2025-01-01T00:00:00Z',
        retry_count: 0
      };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Insert failed' } 
      });

      await expect(repository.create(newNotification)).rejects.toThrow('Erreur lors de la création de la notification');
    });
  });

  describe('markAsRead', () => {
    it('devrait marquer une notification comme lue', async () => {
      mockEq.mockResolvedValue({ error: null });

      await repository.markAsRead('notif-1');

      expect(mockFrom).toHaveBeenCalledWith('notifications');
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({
        status: 'read'
      }));
      expect(mockEq).toHaveBeenCalledWith('id', 'notif-1');
    });

    it('devrait lancer une erreur si marquage échoue', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Update failed' } });

      await expect(repository.markAsRead('notif-1')).rejects.toThrow('Erreur lors du marquage comme lu');
    });
  });

  describe('markAllAsRead', () => {
    it('devrait marquer toutes les notifications comme lues et retourner le nombre', async () => {
      // Mock du comptage
      const mockCountEq = vi.fn()
        .mockResolvedValueOnce({ count: 3, error: null }); // Premier appel: count
      
      // Mock de la mise à jour
      const mockUpdateEq = vi.fn()
        .mockResolvedValueOnce({ error: null }); // Deuxième appel: update

      mockEq
        .mockReturnValueOnce({ eq: mockCountEq }) // Pour le count
        .mockReturnValueOnce({ eq: mockUpdateEq }); // Pour l'update

      const result = await repository.markAllAsRead('user-123');

      expect(result).toBe(3);
      expect(mockFrom).toHaveBeenCalledWith('notifications');
    });

    it('devrait retourner 0 si aucune notification à marquer', async () => {
      const mockCountEq = vi.fn()
        .mockResolvedValue({ count: 0, error: null });

      mockEq.mockReturnValue({ eq: mockCountEq });

      const result = await repository.markAllAsRead('user-123');

      expect(result).toBe(0);
    });

    it('devrait lancer une erreur si comptage échoue', async () => {
      const mockCountEq = vi.fn()
        .mockResolvedValue({ count: null, error: { message: 'Count failed' } });

      mockEq.mockReturnValue({ eq: mockCountEq });

      await expect(repository.markAllAsRead('user-123')).rejects.toThrow('Erreur lors du comptage des notifications');
    });

    it('devrait lancer une erreur si mise à jour échoue', async () => {
      const mockCountEq = vi.fn()
        .mockResolvedValue({ count: 3, error: null });
      
      const mockUpdateEq = vi.fn()
        .mockResolvedValue({ error: { message: 'Update failed' } });

      mockEq
        .mockReturnValueOnce({ eq: mockCountEq })
        .mockReturnValueOnce({ eq: mockUpdateEq });

      await expect(repository.markAllAsRead('user-123')).rejects.toThrow('Erreur lors du marquage de toutes les notifications comme lues');
    });
  });
});
