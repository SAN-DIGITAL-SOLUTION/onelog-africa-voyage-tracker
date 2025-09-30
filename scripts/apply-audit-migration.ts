/**
 * Script d'application de la migration audit_logs
 * 
 * Applique la migration 20250930_create_audit_logs.sql via Supabase client
 * Utilise le service role key pour bypasser RLS
 * 
 * Usage: npm run migrate:audit
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

// Charger les variables d'environnement
dotenv.config();

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.error(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.warn(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`)
};

async function applyMigration() {
  log.section('╔═══════════════════════════════════════════════╗');
  log.section('║   APPLICATION MIGRATION AUDIT_LOGS           ║');
  log.section('╚═══════════════════════════════════════════════╝');
  
  // Validation des variables d'environnement
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    log.error('Variables manquantes: VITE_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  
  log.info(`Supabase URL: ${supabaseUrl}`);
  
  // Créer un client avec service role key (bypass RLS)
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  
  try {
    log.section('\n=== Vérification table audit_logs ===');
    
    // Vérifier si la table existe déjà
    const { data: existingTable, error: checkError } = await supabase
      .from('audit_logs')
      .select('count')
      .limit(1);
    
    if (!checkError) {
      log.warn('La table audit_logs existe déjà !');
      log.info('Voulez-vous continuer ? (la migration utilise IF NOT EXISTS)');
      // Continue quand même car la migration a IF NOT EXISTS
    }
    
    log.section('\n=== Lecture du fichier migration ===');
    
    const migrationPath = join(process.cwd(), 'migrations', '20250930_create_audit_logs.sql');
    let migrationSQL: string;
    
    try {
      migrationSQL = readFileSync(migrationPath, 'utf-8');
      log.success('Migration lue avec succès');
      log.info(`Taille: ${migrationSQL.length} caractères`);
    } catch (err) {
      log.error(`Impossible de lire ${migrationPath}`);
      throw err;
    }
    
    log.section('\n=== Exécution via SQL Editor ===');
    log.warn('NOTE: Supabase JS client ne peut pas exécuter du SQL brut directement');
    log.warn('Vous devez utiliser l\'une des méthodes suivantes:\n');
    
    console.log('OPTION 1 - Supabase Dashboard (Recommandé):');
    console.log(`1. Ouvrez: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/editor/sql`);
    console.log('2. Cliquez sur "New Query"');
    console.log('3. Collez le contenu de migrations/20250930_create_audit_logs.sql');
    console.log('4. Cliquez sur "Run"\n');
    
    console.log('OPTION 2 - Copier-coller SQL:');
    console.log('---BEGIN SQL---');
    console.log(migrationSQL);
    console.log('---END SQL---\n');
    
    console.log('OPTION 3 - psql (si installé):');
    console.log(`psql "${process.env.SUPABASE_DB_URL}" -f migrations/20250930_create_audit_logs.sql\n`);
    
    log.section('\n=== Après application ===');
    log.info('Vérifiez que la migration a réussi avec:');
    console.log('npm run validate:db\n');
    
  } catch (error) {
    log.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

applyMigration();
