/**
 * Invoice Repository
 * 
 * Couche de persistance pour les factures groupées
 * Gère l'accès aux données grouped_invoices et invoice_missions
 * 
 * Pattern: Repository Pattern
 * Responsabilité: CRUD operations sur les factures
 */

import { supabase } from '@/integrations/supabase/client';
import type { GroupedInvoice } from '@/types/billing';

/**
 * Filtres pour la recherche de factures
 */
export interface InvoiceFilter {
  status?: 'draft' | 'sent' | 'paid';
  period_start?: string;
  period_end?: string;
  limit?: number;
}

/**
 * Données pour création facture
 */
export interface CreateInvoiceData {
  billing_partner_id: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  document_urls?: string[];
  status: 'draft' | 'sent' | 'paid';
}

/**
 * Interface du repository Invoice
 */
export interface IInvoiceRepository {
  findById(id: string): Promise<GroupedInvoice | null>;
  findByPartnerId(partnerId: string, filters?: InvoiceFilter): Promise<GroupedInvoice[]>;
  create(invoice: CreateInvoiceData): Promise<GroupedInvoice>;
  addMissions(invoiceId: string, missionIds: string[]): Promise<void>;
  update(id: string, patch: Partial<GroupedInvoice>): Promise<GroupedInvoice>;
  delete(id: string): Promise<void>;
  getPendingForPartner(partnerId: string): Promise<GroupedInvoice[]>;
}

/**
 * Implémentation du repository Invoice
 */
export class InvoiceRepository implements IInvoiceRepository {
  /**
   * Récupère une facture par son ID
   * @param id - UUID de la facture
   * @returns GroupedInvoice ou null si non trouvée
   */
  async findById(id: string): Promise<GroupedInvoice | null> {
    const { data, error } = await supabase
      .from('grouped_invoices')
      .select('*, billing_partners(name, type)')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null;
      }
      throw new Error(`Erreur lors de la récupération de la facture: ${error.message}`);
    }

    return data;
  }

  /**
   * Récupère les factures d'un partenaire avec filtres optionnels
   * @param partnerId - UUID du partenaire de facturation
   * @param filters - Filtres optionnels
   * @returns Liste des factures
   */
  async findByPartnerId(partnerId: string, filters: InvoiceFilter = {}): Promise<GroupedInvoice[]> {
    let query = supabase
      .from('grouped_invoices')
      .select('*, billing_partners(name, type)')
      .eq('billing_partner_id', partnerId)
      .order('created_at', { ascending: false });

    // Appliquer les filtres
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    if (filters.period_start) {
      query = query.gte('period_start', filters.period_start);
    }
    if (filters.period_end) {
      query = query.lte('period_end', filters.period_end);
    }
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des factures: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Crée une nouvelle facture
   * @param invoice - Données de la facture
   * @returns Facture créée
   */
  async create(invoice: CreateInvoiceData): Promise<GroupedInvoice> {
    const { data, error } = await supabase
      .from('grouped_invoices')
      .insert([{
        ...invoice,
        generated_at: new Date().toISOString()
      }])
      .select('*, billing_partners(name, type)')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la création de la facture: ${error.message}`);
    }

    return data;
  }

  /**
   * Ajoute des missions à une facture
   * @param invoiceId - UUID de la facture
   * @param missionIds - Liste des UUIDs des missions
   */
  async addMissions(invoiceId: string, missionIds: string[]): Promise<void> {
    if (missionIds.length === 0) {
      return;
    }

    // Créer les entrées invoice_missions
    const invoiceMissions = missionIds.map(missionId => ({
      invoice_id: invoiceId,
      mission_id: missionId,
      amount: 0 // À calculer selon la logique métier
    }));

    const { error } = await supabase
      .from('invoice_missions')
      .insert(invoiceMissions);

    if (error) {
      // Si erreur de duplication (23505), ignorer
      if (error.code === '23505') {
        return;
      }
      throw new Error(`Erreur lors de l'ajout des missions: ${error.message}`);
    }
  }

  /**
   * Met à jour une facture existante
   * @param id - UUID de la facture
   * @param patch - Données partielles à mettre à jour
   * @returns Facture mise à jour
   */
  async update(id: string, patch: Partial<GroupedInvoice>): Promise<GroupedInvoice> {
    const { data, error } = await supabase
      .from('grouped_invoices')
      .update(patch)
      .eq('id', id)
      .select('*, billing_partners(name, type)')
      .single();

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la facture: ${error.message}`);
    }

    return data;
  }

  /**
   * Supprime une facture
   * @param id - UUID de la facture
   */
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('grouped_invoices')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression de la facture: ${error.message}`);
    }
  }

  /**
   * Récupère les factures en attente pour un partenaire
   * Utile pour le scheduler
   * @param partnerId - UUID du partenaire
   * @returns Liste des factures en attente (draft ou sent)
   */
  async getPendingForPartner(partnerId: string): Promise<GroupedInvoice[]> {
    const { data, error } = await supabase
      .from('grouped_invoices')
      .select('*, billing_partners(name, type)')
      .eq('billing_partner_id', partnerId)
      .in('status', ['draft', 'sent'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération des factures en attente: ${error.message}`);
    }

    return data || [];
  }
}

/**
 * Instance singleton du repository
 * Export pour utilisation dans les services
 */
export const invoiceRepository = new InvoiceRepository();
