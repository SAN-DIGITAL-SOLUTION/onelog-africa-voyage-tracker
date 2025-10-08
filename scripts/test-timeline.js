#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🧪 Lancement des tests Timeline Dashboard...\n');

const testCommands = [
  {
    name: 'Tests unitaires Timeline',
    command: 'npm run test -- __tests__/unit/timeline --reporter=verbose',
    description: 'Tests des composants et services Timeline'
  },
  {
    name: 'Tests E2E Timeline',
    command: 'npx cypress run --spec "cypress/e2e/timeline/**/*.cy.ts"',
    description: 'Tests end-to-end de la Timeline'
  },
  {
    name: 'Coverage Timeline',
    command: 'npm run test:coverage -- __tests__/unit/timeline',
    description: 'Couverture de code des tests Timeline'
  }
];

function runCommand(cmd) {
  try {
    console.log(`▶️  ${cmd.name}`);
    console.log(`   ${cmd.description}`);
    console.log(`   Commande: ${cmd.command}\n`);
    
    const output = execSync(cmd.command, { 
      cwd: process.cwd(),
      stdio: 'inherit'
    });
    
    console.log(`✅ ${cmd.name} - SUCCÈS\n`);
    return true;
  } catch (error) {
    console.error(`❌ ${cmd.name} - ÉCHEC`);
    console.error(`   Code de sortie: ${error.status}`);
    console.error(`   Erreur: ${error.message}\n`);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/test-timeline.js [options]

Options:
  --unit      Exécuter seulement les tests unitaires
  --e2e       Exécuter seulement les tests E2E
  --coverage  Exécuter seulement la couverture
  --all       Exécuter tous les tests (défaut)
  --help, -h  Afficher cette aide

Exemples:
  node scripts/test-timeline.js --unit
  node scripts/test-timeline.js --e2e
  node scripts/test-timeline.js --all
    `);
    return;
  }

  let commandsToRun = [];
  
  if (args.includes('--unit')) {
    commandsToRun.push(testCommands[0]);
  } else if (args.includes('--e2e')) {
    commandsToRun.push(testCommands[1]);
  } else if (args.includes('--coverage')) {
    commandsToRun.push(testCommands[2]);
  } else {
    // Par défaut, exécuter tous les tests
    commandsToRun = testCommands;
  }

  console.log(`📋 ${commandsToRun.length} suite(s) de tests à exécuter\n`);
  
  let successCount = 0;
  let totalCount = commandsToRun.length;
  
  for (const cmd of commandsToRun) {
    if (runCommand(cmd)) {
      successCount++;
    }
  }
  
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log(`   Réussis: ${successCount}/${totalCount}`);
  console.log(`   Échoués: ${totalCount - successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('\n🎉 Tous les tests Timeline sont passés avec succès !');
    process.exit(0);
  } else {
    console.log('\n⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.');
    process.exit(1);
  }
}

main().catch(console.error);
