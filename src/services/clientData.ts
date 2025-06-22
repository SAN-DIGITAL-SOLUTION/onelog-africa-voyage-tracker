// fichier: src/services/clientData.ts
import { supabase } from './supabaseClient';

export async function getClientMissions() {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .eq('user_role', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getClientInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_role', 'client')
    .order('issued_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getClientNotifications() {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_role', 'client')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}
