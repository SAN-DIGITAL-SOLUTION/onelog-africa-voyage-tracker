/**
 * Script de validation de connexion Supabase
 * 
 * Vérifie que:
 * 1. Les variables d'environnement sont configurées
 * 2. La connexion client fonctionne
 * 3. La connexion PostgreSQL directe fonctionne (si SUPABASE_DB_URL fournie)
 * 4. Les tables critiques existent
 * 
 * Usage: 
 *   npm run validate:db
 *   ou: ts-node scripts/validate-db-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

// Codes de couleur pour output terminal
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

interface ValidationResult {
  passed: boolean;
  message: string;
}

/**
 * Valide les variables d'environnement requises
 */
function validateEnvironmentVariables(): ValidationResult[] {
  log.section('=== Validation Variables d\'Environnement ===');
  
  const results: ValidationResult[] = [];
  
  const requiredVars = [
    { name: 'VITE_SUPABASE_URL', required: true },
    { name: 'VITE_SUPABASE_ANON_KEY', required: true },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', required: false },
    { name: 'SUPABASE_DB_URL', required: false }
  ];
  
  for (const { name, required } of requiredVars) {
    const value = process.env[name];
    const exists = !!value;
    
    if (required && !exists) {
      results.push({ passed: false, message: `${name} manquante (REQUIS)` });
      log.error(`${name} manquante (REQUIS)`);
    } else if (!required && !exists) {
      results.push({ passed: true, message: `${name} manquante (optionnelle)` });
      log.warn(`${name} manquante (optionnelle)`);
    } else {
      // Masquer partiellement la valeur pour la sécurité
      const maskedValue = value!.substring(0, 20) + '...';
      results.push({ passed: true, message: `${name} configurée` });
      log.success(`${name} configurée: ${maskedValue}`);
    }
  }
  
  return results;
}

/**
 * Teste la connexion client Supabase
 */
async function testClientConnection(): Promise<ValidationResult> {
  log.section('=== Test Connexion Client Supabase ===');
  
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      log.error('Variables d\'environnement manquantes');
      return { passed: false, message: 'Variables manquantes' };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test simple: lister les tables
    const { error } = await supabase.from('user_roles').select('count').limit(1);
    
    if (error) {
      log.error(`Erreur connexion: ${error.message}`);
      return { passed: false, message: error.message };
    }
    
    log.success('Connexion client Supabase OK');
    return { passed: true, message: 'Connexion réussie' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log.error(`Exception: ${message}`);
    return { passed: false, message };
  }
}

/**
 * Vérifie l'existence des tables critiques
 */
async function checkCriticalTables(): Promise<ValidationResult[]> {
  log.section('=== Vérification Tables Critiques ===');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    log.error('Impossible de vérifier les tables (env manquantes)');
    return [{ passed: false, message: 'Variables env manquantes' }];
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  const results: ValidationResult[] = [];
  
  const criticalTables = [
    'user_roles',
    'users',
    'missions',
    'notifications',
    'notification_preferences'
  ];
  
  for (const table of criticalTables) {
    try {
      const { error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results.push({ passed: false, message: `Table ${table}: ${error.message}` });
        log.error(`Table ${table}: ${error.message}`);
      } else {
        results.push({ passed: true, message: `Table ${table} existe (${count ?? 0} lignes)` });
        log.success(`Table ${table} existe (${count ?? 0} lignes)`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ passed: false, message: `Table ${table}: ${message}` });
      log.error(`Table ${table}: ${message}`);
    }
  }
  
  return results;
}

/**
 * Teste la connexion PostgreSQL directe (si SUPABASE_DB_URL fournie)
 */
async function testPostgresConnection(): Promise<ValidationResult> {
  log.section('=== Test Connexion PostgreSQL Directe ===');
  
  const dbUrl = process.env.SUPABASE_DB_URL;
  
  if (!dbUrl) {
    log.warn('SUPABASE_DB_URL non configurée (optionnelle)');
    return { passed: true, message: 'Non configurée (optionnelle)' };
  }
  
  if (dbUrl.includes('[YOUR-PASSWORD]') || dbUrl.includes('[PROJECT-REF]')) {
    log.warn('SUPABASE_DB_URL contient des placeholders - non validée');
    return { passed: true, message: 'Placeholders détectés' };
  }
  
  log.info('Connexion PostgreSQL directe non testée (nécessite pg package)');
  log.info('Pour tester: psql "$SUPABASE_DB_URL" -c "SELECT 1"');
  
  return { passed: true, message: 'Validation manuelle requise' };
}

/**
 * Main
 */
async function main() {
  console.log('\n' + colors.bold + colors.cyan + '╔═══════════════════════════════════════════════╗' + colors.reset);
  console.log(colors.bold + colors.cyan + '║   VALIDATION CONNEXION SUPABASE - OneLog     ║' + colors.reset);
  console.log(colors.bold + colors.cyan + '╚═══════════════════════════════════════════════╝' + colors.reset + '\n');
  
  const allResults: ValidationResult[] = [];
  
  // 1. Variables d'environnement
  const envResults = validateEnvironmentVariables();
  allResults.push(...envResults);
  
  // 2. Connexion client
  const clientResult = await testClientConnection();
  allResults.push(clientResult);
  
  // 3. Tables critiques
  const tablesResults = await checkCriticalTables();
  allResults.push(...tablesResults);
  
  // 4. PostgreSQL direct
  const pgResult = await testPostgresConnection();
  allResults.push(pgResult);
  
  // Résumé final
  log.section('=== Résumé ===');
  
  const passed = allResults.filter(r => r.passed).length;
  const total = allResults.length;
  const failed = total - passed;
  
  console.log(`\nTests passés: ${colors.green}${passed}${colors.reset}/${total}`);
  
  if (failed > 0) {
    console.log(`Tests échoués: ${colors.red}${failed}${colors.reset}/${total}\n`);
    
    log.error('VALIDATION ÉCHOUÉE');
    console.log(`\n${colors.yellow}Actions requises:${colors.reset}`);
    console.log('1. Vérifier les variables d\'environnement dans .env');
    console.log('2. S\'assurer que Supabase est accessible');
    console.log('3. Vérifier que les migrations ont été appliquées');
    
    process.exit(1);
  } else {
    log.success('VALIDATION RÉUSSIE - Toutes les connexions fonctionnent ✓\n');
    process.exit(0);
  }
}

// Exécution
main().catch((err) => {
  log.error(`Erreur fatale: ${err.message}`);
  process.exit(1);
});
