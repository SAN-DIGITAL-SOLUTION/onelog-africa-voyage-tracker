import { supabase } from '@/integrations/supabase/client';
import type { BillingPartner, GroupedInvoice, Mission } from '@/types/billing';

export class BillingService {
  /**
   * Récupère tous les partenaires de facturation
   */
  async getBillingPartners(): Promise<BillingPartner[]> {
    const { data, error } = await supabase
      .from('billing_partners')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  /**
   * Génère des factures groupées pour un partenaire et une période
   */
  /**
   * Appelle la fonction Supabase pour générer une facture groupée et renvoie l'URL du PDF.
   */
  async generateGroupedInvoice(partnerId: string, startDate: Date, endDate: Date): Promise<string> {
    const { data, error } = await supabase.functions.invoke('generate-grouped-invoice-pdf', {
      body: {
        billing_partner_id: partnerId,
        start_date: startDate.toISOString().split('T')[0], // Format YYYY-MM-DD
        end_date: endDate.toISOString().split('T')[0],     // Format YYYY-MM-DD
      },
    });

    if (error) {
      throw new Error(`Erreur lors de la génération de la facture: ${error.message}`);
    }

    if (!data.pdfUrl) {
      throw new Error('Aucune URL de PDF retournée par la fonction.');
    }

    return data.pdfUrl;
  }

  /**
   * @deprecated La logique est maintenant gérée côté serveur par generateGroupedInvoice.
   * Génère des factures groupées pour un partenaire et une période
   */
  async generatePeriodicInvoices(
    partnerId: string,
    periodStart: Date,
    periodEnd: Date
  ): Promise<GroupedInvoice[]> {
    // 1. Récupérer les missions de la période
    const { data: missions } = await supabase
      .from('missions')
      .select('*, vehicles(*), clients(*)')
      .eq('billing_partner_id', partnerId)
      .gte('created_at', periodStart.toISOString())
      .lte('created_at', periodEnd.toISOString())
      .eq('status', 'completed');

    if (!missions || missions.length === 0) {
      return [];
    }

    // 2. Calculer le total par client
    const clientTotals = missions.reduce((acc, mission) => {
      const clientId = mission.client_id;
      if (!acc[clientId]) {
        acc[clientId] = {
          missions: [],
          totalAmount: 0,
          client: mission.clients
        };
      }
      acc[clientId].missions.push(mission);
      acc[clientId].totalAmount += mission.price || 0;
      return acc;
    }, {} as Record<string, any>);

    // 3. Créer les factures groupées
    const invoices: GroupedInvoice[] = [];

    for (const [clientId, data] of Object.entries(clientTotals)) {
      const invoice = await this.createGroupedInvoice(
        partnerId,
        clientId,
        data.missions,
        periodStart,
        periodEnd,
        data.totalAmount
      );
      invoices.push(invoice);
    }

    return invoices;
  }

  /**
   * Crée une facture groupée
   */
  private async createGroupedInvoice(
    partnerId: string,
    clientId: string,
    missions: Mission[],
    periodStart: Date,
    periodEnd: Date,
    totalAmount: number
  ): Promise<GroupedInvoice> {
    // 1. Créer l'enregistrement de facture
    const { data: invoice, error } = await supabase
      .from('grouped_invoices')
      .insert({
        billing_partner_id: partnerId,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        total_amount: totalAmount,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Associer les missions à la facture
    const missionLinks = missions.map(mission => ({
      invoice_id: invoice.id,
      mission_id: mission.id,
      amount: mission.price || 0
    }));

    const { error: linkError } = await supabase
      .from('invoice_missions')
      .insert(missionLinks);

    if (linkError) throw linkError;

    // 3. Générer et attacher les documents
    const documents = await this.generateDocuments(invoice.id, missions);
    
    await supabase
      .from('grouped_invoices')
      .update({ document_urls: documents })
      .eq('id', invoice.id);

    return invoice;
  }

  /**
   * Génère les documents requis pour une facture
   */
  private async generateDocuments(
    invoiceId: string,
    missions: Mission[]
  ): Promise<string[]> {
    const documents: string[] = [];

    // Générer la facture PDF
    const invoiceDoc = await this.generateInvoicePDF(invoiceId, missions);
    documents.push(invoiceDoc);

    // Générer le récapitulatif des missions
    const summaryDoc = await this.generateMissionSummary(missions);
    documents.push(summaryDoc);

    return documents;
  }

  /**
   * Génère un PDF de facture
   */
  private async generateInvoicePDF(
    invoiceId: string,
    missions: Mission[]
  ): Promise<string> {
    // Logique de génération PDF (utiliser jsPDF ou service externe)
    const pdfUrl = `/invoices/${invoiceId}.pdf`;
    return pdfUrl;
  }

  /**
   * Génère un récapitulatif des missions
   */
  private async generateMissionSummary(missions: Mission[]): Promise<string> {
    // Logique de génération du récapitulatif
    const summaryUrl = `/summaries/${Date.now()}.pdf`;
    return summaryUrl;
  }

  /**
   * Récupère les factures d'un partenaire
   */
  async getInvoicesByPartner(partnerId: string): Promise<GroupedInvoice[]> {
    const { data, error } = await supabase
      .from('grouped_invoices')
      .select('*, billing_partners(name)')
      .eq('billing_partner_id', partnerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Envoie une facture par email
   */
  async sendInvoice(invoiceId: string, email: string): Promise<void> {
    const { data: invoice } = await supabase
      .from('grouped_invoices')
      .select('*, billing_partners(*)')
      .eq('id', invoiceId)
      .single();

    if (!invoice) throw new Error('Invoice not found');

    // Envoi via service email (SendGrid/MailerSend)
    await this.sendEmailWithInvoice(invoice, email);

    // Marquer comme envoyée
    await supabase
      .from('grouped_invoices')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', invoiceId);
  }

  /**
   * Calcule la période de facturation automatique
   */
  getBillingPeriod(
    periodType: 'weekly' | 'biweekly' | 'monthly',
    referenceDate: Date = new Date()
  ): { start: Date; end: Date } {
    const start = new Date(referenceDate);
    const end = new Date(referenceDate);

    switch (periodType) {
      case 'weekly':
        start.setDate(start.getDate() - start.getDay());
        end.setDate(start.getDate() + 6);
        break;
      case 'biweekly':
        const weekNumber = Math.floor(start.getDate() / 7);
        start.setDate(start.getDate() - (start.getDate() % 14));
        end.setDate(start.getDate() + 13);
        break;
      case 'monthly':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        break;
    }

    return { start, end };
  }

  /**
   * Service email privé
   */
  private async sendEmailWithInvoice(invoice: any, email: string): Promise<void> {
    // Intégration avec service email existant
    console.log(`Envoi facture ${invoice.id} à ${email}`);
  }
}
