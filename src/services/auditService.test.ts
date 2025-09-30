/**
 * Tests unitaires pour AuditService
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { auditService } from './auditService';
import type { LogActionOptions } from './auditService';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    rpc: vi.fn(),
    from: vi.fn()
  }
}));

describe('AuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAction', () => {
    it('devrait logger une action avec succès', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const options: LogActionOptions = {
        actorId: 'user-123',
        actorRole: 'admin',
        entity: 'mission',
        entityId: 'mission-456',
        action: 'create',
        context: { test: 'data' }
      };

      const logId = await auditService.logAction(options);

      expect(logId).toBe('mock-log-id');
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_actor_id: 'user-123',
          p_actor_role: 'admin',
          p_entity: 'mission',
          p_entity_id: 'mission-456',
          p_action: 'create'
        })
      );
    });

    it('devrait retourner null en cas d\'erreur et ne pas throw', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: null,
        error: { message: 'Erreur de connexion' }
      } as any);

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const options: LogActionOptions = {
        actorId: 'user-123',
        entity: 'mission',
        action: 'create'
      };

      const logId = await auditService.logAction(options);

      expect(logId).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('logCreate', () => {
    it('devrait logger une création', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const logId = await auditService.logCreate(
        'user-123',
        'mission',
        'mission-456',
        { title: 'Nouvelle mission' }
      );

      expect(logId).toBe('mock-log-id');
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_action: 'create',
          p_entity: 'mission',
          p_entity_id: 'mission-456'
        })
      );
    });
  });

  describe('logUpdate', () => {
    it('devrait logger une mise à jour', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const logId = await auditService.logUpdate(
        'user-123',
        'user',
        'user-456',
        { role: 'admin' }
      );

      expect(logId).toBe('mock-log-id');
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_action: 'update',
          p_entity: 'user'
        })
      );
    });
  });

  describe('logDelete', () => {
    it('devrait logger une suppression', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const logId = await auditService.logDelete(
        'user-123',
        'document',
        'doc-789'
      );

      expect(logId).toBe('mock-log-id');
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_action: 'delete',
          p_entity: 'document',
          p_entity_id: 'doc-789'
        })
      );
    });
  });

  describe('logAccessDenied', () => {
    it('devrait logger un accès refusé avec success=false', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const logId = await auditService.logAccessDenied(
        'user-123',
        'invoice',
        'invoice-999',
        { reason: 'Insufficient permissions' }
      );

      expect(logId).toBe('mock-log-id');
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_action: 'access_denied',
          p_success: false
        })
      );
    });
  });

  describe('withAudit', () => {
    it('devrait wrapper une fonction et logger son exécution', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const testFn = vi.fn().mockResolvedValue({ id: 'result-123', data: 'test' });

      const result = await auditService.withAudit(
        'user-123',
        'mission',
        'create',
        testFn,
        { test: true }
      );

      expect(result).toEqual({ id: 'result-123', data: 'test' });
      expect(testFn).toHaveBeenCalled();
      
      // Attendre que le log async soit terminé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_action: 'create',
          p_success: true,
          p_entity_id: 'result-123'
        })
      );
    });

    it('devrait logger un échec si la fonction throw', async () => {
      const { supabase } = await import('@/integrations/supabase/client');
      const mockRpc = vi.mocked(supabase.rpc);
      
      mockRpc.mockResolvedValue({
        data: 'mock-log-id',
        error: null
      } as any);

      const testFn = vi.fn().mockRejectedValue(new Error('Test error'));

      await expect(
        auditService.withAudit('user-123', 'mission', 'delete', testFn)
      ).rejects.toThrow('Test error');

      // Attendre que le log async soit terminé
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(mockRpc).toHaveBeenCalledWith(
        'log_audit_action',
        expect.objectContaining({
          p_success: false,
          p_error_message: 'Test error'
        })
      );
    });
  });
});
