import { supabase } from '../integrations/supabase/client';

export async function getInvoices() {
  const { data, error } = await supabase.from('invoices').select('*').order('date', { ascending: false });
  if (error) throw new Error(error.message);
  return data || [];
}

export async function exportInvoicesPDF(invoices: any[]) {
  // Appel à l’Edge Function pour générer un PDF
  const res = await fetch('https://fhiegxnqgjlgpbywujzo.functions.supabase.co/export-invoices-pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices })
  });
  if (!res.ok) throw new Error('Erreur lors de la génération du PDF');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'factures.pdf';
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function exportInvoicesCSV(invoices: any[]) {
  // Appel à l’Edge Function pour générer un CSV
  const res = await fetch('https://fhiegxnqgjlgpbywujzo.functions.supabase.co/export-invoices-csv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoices })
  });
  if (!res.ok) throw new Error('Erreur lors de la génération du CSV');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'factures.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}

export async function sendInvoiceByEmail(invoiceId: string) {
  // Appel à l’Edge Function pour envoyer la facture par email
  const res = await fetch('https://fhiegxnqgjlgpbywujzo.functions.supabase.co/send-invoice-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ invoiceId })
  });
  if (!res.ok) throw new Error('Erreur lors de l’envoi de la facture par email');
  return await res.json();
}
