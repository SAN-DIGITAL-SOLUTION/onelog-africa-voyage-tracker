/**
 * Client Supabase Canonique
 * 
 * ATTENTION: Ceci est le SEUL client Supabase à utiliser dans toute l'application.
 * Ne PAS créer d'autres instances de createClient().
 * 
 * Importer avec: import { supabase } from '@/integrations/supabase/client';
 */

import { createClient } from '@supabase/supabase-js';

// Variables d'environnement avec validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation des variables d'environnement
if (!supabaseUrl) {
  throw new Error(
    'VITE_SUPABASE_URL manquante. Vérifiez votre fichier .env'
  );
}

if (!supabaseAnonKey) {
  throw new Error(
    'VITE_SUPABASE_ANON_KEY manquante. Vérifiez votre fichier .env'
  );
}

// Création du client unique (singleton)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Export du type pour utilisation dans d'autres fichiers
export type SupabaseClient = typeof supabase;
