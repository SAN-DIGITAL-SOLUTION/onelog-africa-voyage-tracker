/**
 * Tests unitaires pour UserRepository
 * 
 * Teste toutes les méthodes CRUD avec mocks Supabase
 * Couvre les cas de succès et d'erreur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserRepository } from '@/repositories/userRepository';
import type { UserProfile, UserRole } from '@/types/user';
import type { CreateUserData, UserMetadata } from '@/repositories/userRepository';

// Mock du client Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      admin: {
        updateUserById: vi.fn()
      }
    }
  }
}));

import { supabase } from '@/integrations/supabase/client';

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockOrder: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockIlike: ReturnType<typeof vi.fn>;
  let mockGte: ReturnType<typeof vi.fn>;
  let mockLte: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new UserRepository();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSingle = vi.fn();
    mockEq = vi.fn(() => ({ single: mockSingle, select: mockSelect }));
    mockIlike = vi.fn(() => ({ eq: mockEq, ilike: mockIlike, gte: mockGte, lte: mockLte, order: mockOrder }));
    mockGte = vi.fn(() => ({ eq: mockEq, ilike: mockIlike, gte: mockGte, lte: mockLte, order: mockOrder }));
    mockLte = vi.fn(() => ({ eq: mockEq, ilike: mockIlike, gte: mockGte, lte: mockLte, order: mockOrder }));
    mockSelect = vi.fn(() => ({ eq: mockEq, single: mockSingle, order: mockOrder, ilike: mockIlike, gte: mockGte, lte: mockLte }));
    mockOrder = vi.fn(() => ({ eq: mockEq, ilike: mockIlike, gte: mockGte, lte: mockLte }));
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
    it('devrait retourner un utilisateur existant', async () => {
      const mockUser: UserProfile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await repository.findById('user-123');

      expect(result).toEqual(mockUser);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockSelect).toHaveBeenCalledWith('id, name, email, role, created_at');
      expect(mockEq).toHaveBeenCalledWith('id', 'user-123');
    });

    it('devrait retourner null si utilisateur non trouvé', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' } 
      });

      const result = await repository.findById('user-999');

      expect(result).toBeNull();
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST500', message: 'Database error' } 
      });

      await expect(repository.findById('user-123')).rejects.toThrow('Erreur lors de la récupération de l\'utilisateur');
    });
  });

  describe('findByEmail', () => {
    it('devrait retourner un utilisateur par email', async () => {
      const mockUser: UserProfile = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'admin',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: mockUser, error: null });

      const result = await repository.findByEmail('john@example.com');

      expect(result).toEqual(mockUser);
      expect(mockEq).toHaveBeenCalledWith('email', 'john@example.com');
    });

    it('devrait retourner null si email non trouvé', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' } 
      });

      const result = await repository.findByEmail('notfound@example.com');

      expect(result).toBeNull();
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST500', message: 'Database error' } 
      });

      await expect(repository.findByEmail('john@example.com')).rejects.toThrow('Erreur lors de la récupération de l\'utilisateur par email');
    });
  });

  describe('findAll', () => {
    it('devrait retourner tous les utilisateurs sans filtre', async () => {
      const mockUsers: UserProfile[] = [
        {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
          role: 'admin',
          created_at: '2025-01-01T00:00:00Z'
        },
        {
          id: 'user-2',
          name: 'User 2',
          email: 'user2@example.com',
          role: 'client',
          created_at: '2025-01-02T00:00:00Z'
        }
      ];

      mockOrder.mockResolvedValue({ data: mockUsers, error: null });

      const result = await repository.findAll();

      expect(result).toEqual(mockUsers);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('devrait retourner un tableau vide si aucun utilisateur', async () => {
      mockOrder.mockResolvedValue({ data: null, error: null });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockOrder.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(repository.findAll()).rejects.toThrow('Erreur lors de la récupération des utilisateurs');
    });
  });

  describe('create', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const newUser: CreateUserData = {
        id: 'user-new',
        name: 'New User',
        email: 'new@example.com',
        role: 'client'
      };

      const createdUser: UserProfile = {
        ...newUser,
        created_at: '2025-01-03T00:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: createdUser, error: null });

      const result = await repository.create(newUser);

      expect(result).toEqual(createdUser);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockInsert).toHaveBeenCalledWith([{
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }]);
    });

    it('devrait lancer une erreur si création échoue', async () => {
      const newUser: CreateUserData = {
        id: 'user-new',
        name: 'New User',
        email: 'new@example.com',
        role: 'client'
      };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Duplicate key' } 
      });

      await expect(repository.create(newUser)).rejects.toThrow('Erreur lors de la création de l\'utilisateur');
    });
  });

  describe('update', () => {
    it('devrait mettre à jour un utilisateur existant', async () => {
      const updates: Partial<UserProfile> = {
        name: 'Updated Name',
        role: 'operateur'
      };

      const updatedUser: UserProfile = {
        id: 'user-1',
        name: 'Updated Name',
        email: 'user1@example.com',
        role: 'operateur',
        created_at: '2025-01-01T00:00:00Z'
      };

      mockSingle.mockResolvedValue({ data: updatedUser, error: null });

      const result = await repository.update('user-1', updates);

      expect(result).toEqual(updatedUser);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockUpdate).toHaveBeenCalledWith({
        name: 'Updated Name',
        role: 'operateur'
      });
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('devrait lancer une erreur si mise à jour échoue', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Update failed' } 
      });

      await expect(repository.update('user-1', { name: 'Test' })).rejects.toThrow('Erreur lors de la mise à jour de l\'utilisateur');
    });
  });

  describe('delete', () => {
    it('devrait supprimer un utilisateur', async () => {
      mockEq.mockResolvedValue({ error: null });

      await repository.delete('user-1');

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'user-1');
    });

    it('devrait lancer une erreur si suppression échoue', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(repository.delete('user-1')).rejects.toThrow('Erreur lors de la suppression de l\'utilisateur');
    });
  });

  describe('updateAuthMetadata', () => {
    it('devrait mettre à jour les métadonnées auth', async () => {
      const metadata: UserMetadata = {
        name: 'John Doe',
        role: 'admin'
      };

      (supabase.auth.admin.updateUserById as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        data: {}, 
        error: null 
      });

      await repository.updateAuthMetadata('user-123', metadata);

      expect(supabase.auth.admin.updateUserById).toHaveBeenCalledWith('user-123', {
        user_metadata: metadata
      });
    });

    it('devrait lancer une erreur si mise à jour auth échoue', async () => {
      const metadata: UserMetadata = {
        name: 'John Doe',
        role: 'admin'
      };

      (supabase.auth.admin.updateUserById as ReturnType<typeof vi.fn>).mockResolvedValue({ 
        data: null, 
        error: { message: 'Auth update failed' } 
      });

      await expect(repository.updateAuthMetadata('user-123', metadata)).rejects.toThrow('Erreur lors de la mise à jour des métadonnées auth');
    });
  });
});
