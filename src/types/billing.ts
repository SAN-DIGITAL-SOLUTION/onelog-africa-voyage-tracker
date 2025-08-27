export interface BillingPartner {
  id: string;
  name: string;
  type: 'MEDLOG' | 'MAERSK' | 'CUSTOM';
  billing_period: 'weekly' | 'biweekly' | 'monthly';
  payment_terms: number;
  required_documents: DocumentType[];
  contact_email?: string;
  contact_phone?: string;
  address?: any;
  created_at: string;
  updated_at: string;
}

export interface GroupedInvoice {
  id: string;
  billing_partner_id: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  document_urls: string[];
  status: 'draft' | 'sent' | 'paid';
  created_at: string;
  generated_at?: string;
  sent_at?: string;
  billing_partners?: {
    name: string;
    type: string;
  };
}

export interface InvoiceMission {
  invoice_id: string;
  mission_id: string;
  amount: number;
}

export type DocumentType = 'BL' | 'CMR' | 'EIR' | 'INVOICE' | 'RECEIPT';

export interface BillingPeriod {
  start: Date;
  end: Date;
}

export interface GenerateInvoiceParams {
  partnerId: string;
  startDate: Date;
  endDate: Date;
}
