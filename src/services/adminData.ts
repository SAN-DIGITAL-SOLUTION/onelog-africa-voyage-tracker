import { supabase } from './supabaseClient';

export async function getAllUsers() {
  const { data, error } = await supabase.from('users').select('*');
  if (error) throw error;
  return data || [];
}

export async function getAllMissions() {
  const { data, error } = await supabase.from('missions').select('*');
  if (error) throw error;
  return data || [];
}

export async function getAllInvoices() {
  const { data, error } = await supabase.from('invoices').select('*');
  if (error) throw error;
  return data || [];
}
