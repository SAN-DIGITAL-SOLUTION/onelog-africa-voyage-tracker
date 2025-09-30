/**
 * Tests unitaires pour InvoiceRepository
 * 
 * Teste toutes les méthodes avec mocks Supabase
 * Couvre les cas de succès et d'erreur
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InvoiceRepository } from '@/repositories/invoiceRepository';
import type { GroupedInvoice } from '@/types/billing';
import type { CreateInvoiceData, InvoiceFilter } from '@/repositories/invoiceRepository';

// Mock du client Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn()
  }
}));

import { supabase } from '@/integrations/supabase/client';

describe('InvoiceRepository', () => {
  let repository: InvoiceRepository;
  let mockFrom: ReturnType<typeof vi.fn>;
  let mockSelect: ReturnType<typeof vi.fn>;
  let mockEq: ReturnType<typeof vi.fn>;
  let mockSingle: ReturnType<typeof vi.fn>;
  let mockOrder: ReturnType<typeof vi.fn>;
  let mockInsert: ReturnType<typeof vi.fn>;
  let mockUpdate: ReturnType<typeof vi.fn>;
  let mockDelete: ReturnType<typeof vi.fn>;
  let mockIn: ReturnType<typeof vi.fn>;
  let mockGte: ReturnType<typeof vi.fn>;
  let mockLte: ReturnType<typeof vi.fn>;
  let mockLimit: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    repository = new InvoiceRepository();
    
    // Reset mocks
    vi.clearAllMocks();
    
    // Setup mock chain
    mockSingle = vi.fn();
    mockLimit = vi.fn(() => ({ then: vi.fn() }));
    mockLte = vi.fn(() => ({ limit: mockLimit, then: vi.fn() }));
    mockGte = vi.fn(() => ({ lte: mockLte, limit: mockLimit, then: vi.fn() }));
    mockIn = vi.fn(() => ({ order: mockOrder }));
    mockEq = vi.fn(() => ({ 
      single: mockSingle, 
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      in: mockIn,
      gte: mockGte,
      lte: mockLte,
      limit: mockLimit
    }));
    mockOrder = vi.fn(() => ({ 
      eq: mockEq,
      gte: mockGte,
      lte: mockLte,
      limit: mockLimit,
      then: vi.fn()
    }));
    mockSelect = vi.fn(() => ({ 
      eq: mockEq, 
      single: mockSingle,
      order: mockOrder,
      in: mockIn
    }));
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
    it('devrait retourner une facture existante', async () => {
      const mockInvoice: GroupedInvoice = {
        id: 'invoice-1',
        billing_partner_id: 'partner-1',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        total_amount: 1000,
        document_urls: ['url1'],
        status: 'draft',
        created_at: '2025-01-01T00:00:00Z',
        billing_partners: {
          name: 'MEDLOG',
          type: 'MEDLOG'
        }
      };

      mockSingle.mockResolvedValue({ data: mockInvoice, error: null });

      const result = await repository.findById('invoice-1');

      expect(result).toEqual(mockInvoice);
      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockSelect).toHaveBeenCalledWith('*, billing_partners(name, type)');
      expect(mockEq).toHaveBeenCalledWith('id', 'invoice-1');
    });

    it('devrait retourner null si facture non trouvée', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST116', message: 'Not found' } 
      });

      const result = await repository.findById('invoice-999');

      expect(result).toBeNull();
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { code: 'PGRST500', message: 'Database error' } 
      });

      await expect(repository.findById('invoice-1')).rejects.toThrow('Erreur lors de la récupération de la facture');
    });
  });

  describe('findByPartnerId', () => {
    it('devrait retourner les factures d\'un partenaire', async () => {
      const mockInvoices: GroupedInvoice[] = [
        {
          id: 'invoice-1',
          billing_partner_id: 'partner-1',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
          total_amount: 1000,
          document_urls: [],
          status: 'draft',
          created_at: '2025-01-01T00:00:00Z',
          billing_partners: {
            name: 'MEDLOG',
            type: 'MEDLOG'
          }
        }
      ];

      mockOrder.mockResolvedValue({ data: mockInvoices, error: null });

      const result = await repository.findByPartnerId('partner-1');

      expect(result).toEqual(mockInvoices);
      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockEq).toHaveBeenCalledWith('billing_partner_id', 'partner-1');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('devrait retourner un tableau vide si aucune facture', async () => {
      mockOrder.mockResolvedValue({ data: null, error: null });

      const result = await repository.findByPartnerId('partner-1');

      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockOrder.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(repository.findByPartnerId('partner-1')).rejects.toThrow('Erreur lors de la récupération des factures');
    });
  });

  describe('create', () => {
    it('devrait créer une nouvelle facture', async () => {
      const newInvoice: CreateInvoiceData = {
        billing_partner_id: 'partner-1',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        total_amount: 1000,
        status: 'draft'
      };

      const createdInvoice: GroupedInvoice = {
        id: 'invoice-new',
        ...newInvoice,
        document_urls: [],
        created_at: '2025-01-01T00:00:00Z',
        generated_at: '2025-01-01T00:00:00Z',
        billing_partners: {
          name: 'MEDLOG',
          type: 'MEDLOG'
        }
      };

      mockSingle.mockResolvedValue({ data: createdInvoice, error: null });

      const result = await repository.create(newInvoice);

      expect(result).toEqual(createdInvoice);
      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('devrait lancer une erreur si création échoue', async () => {
      const newInvoice: CreateInvoiceData = {
        billing_partner_id: 'partner-1',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        total_amount: 1000,
        status: 'draft'
      };

      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Insert failed' } 
      });

      await expect(repository.create(newInvoice)).rejects.toThrow('Erreur lors de la création de la facture');
    });
  });

  describe('addMissions', () => {
    it('devrait ajouter des missions à une facture', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockResolvedValue({ error: null })
      });

      await repository.addMissions('invoice-1', ['mission-1', 'mission-2']);

      expect(mockFrom).toHaveBeenCalledWith('invoice_missions');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('devrait ne rien faire si liste vide', async () => {
      await repository.addMissions('invoice-1', []);

      expect(mockFrom).not.toHaveBeenCalled();
    });

    it('devrait ignorer les erreurs de duplication', async () => {
      mockInsert.mockReturnValue({
        select: vi.fn().mockResolvedValue({ 
          error: { code: '23505', message: 'Duplicate' } 
        })
      });

      await expect(repository.addMissions('invoice-1', ['mission-1'])).resolves.not.toThrow();
    });

    it('devrait lancer une erreur pour autres erreurs', async () => {
      mockFrom.mockReturnValue({
        insert: vi.fn().mockResolvedValue({ 
          error: { code: 'OTHER', message: 'Other error' } 
        })
      });

      await expect(repository.addMissions('invoice-1', ['mission-1'])).rejects.toThrow('Erreur lors de l\'ajout des missions');
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une facture existante', async () => {
      const updates: Partial<GroupedInvoice> = {
        status: 'sent',
        sent_at: '2025-01-02T00:00:00Z'
      };

      const updatedInvoice: GroupedInvoice = {
        id: 'invoice-1',
        billing_partner_id: 'partner-1',
        period_start: '2025-01-01',
        period_end: '2025-01-31',
        total_amount: 1000,
        document_urls: [],
        status: 'sent',
        sent_at: '2025-01-02T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        billing_partners: {
          name: 'MEDLOG',
          type: 'MEDLOG'
        }
      };

      mockSingle.mockResolvedValue({ data: updatedInvoice, error: null });

      const result = await repository.update('invoice-1', updates);

      expect(result).toEqual(updatedInvoice);
      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'invoice-1');
    });

    it('devrait lancer une erreur si mise à jour échoue', async () => {
      mockSingle.mockResolvedValue({ 
        data: null, 
        error: { message: 'Update failed' } 
      });

      await expect(repository.update('invoice-1', { status: 'sent' })).rejects.toThrow('Erreur lors de la mise à jour de la facture');
    });
  });

  describe('delete', () => {
    it('devrait supprimer une facture', async () => {
      mockEq.mockResolvedValue({ error: null });

      await repository.delete('invoice-1');

      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'invoice-1');
    });

    it('devrait lancer une erreur si suppression échoue', async () => {
      mockEq.mockResolvedValue({ error: { message: 'Delete failed' } });

      await expect(repository.delete('invoice-1')).rejects.toThrow('Erreur lors de la suppression de la facture');
    });
  });

  describe('getPendingForPartner', () => {
    it('devrait retourner les factures en attente', async () => {
      const mockPendingInvoices: GroupedInvoice[] = [
        {
          id: 'invoice-1',
          billing_partner_id: 'partner-1',
          period_start: '2025-01-01',
          period_end: '2025-01-31',
          total_amount: 1000,
          document_urls: [],
          status: 'draft',
          created_at: '2025-01-01T00:00:00Z',
          billing_partners: {
            name: 'MEDLOG',
            type: 'MEDLOG'
          }
        }
      ];

      mockOrder.mockResolvedValue({ data: mockPendingInvoices, error: null });

      const result = await repository.getPendingForPartner('partner-1');

      expect(result).toEqual(mockPendingInvoices);
      expect(mockFrom).toHaveBeenCalledWith('grouped_invoices');
      expect(mockEq).toHaveBeenCalledWith('billing_partner_id', 'partner-1');
      expect(mockIn).toHaveBeenCalledWith('status', ['draft', 'sent']);
    });

    it('devrait retourner un tableau vide si aucune facture en attente', async () => {
      mockOrder.mockResolvedValue({ data: null, error: null });

      const result = await repository.getPendingForPartner('partner-1');

      expect(result).toEqual([]);
    });

    it('devrait lancer une erreur en cas de problème DB', async () => {
      mockOrder.mockResolvedValue({ 
        data: null, 
        error: { message: 'Database error' } 
      });

      await expect(repository.getPendingForPartner('partner-1')).rejects.toThrow('Erreur lors de la récupération des factures en attente');
    });
  });
});
