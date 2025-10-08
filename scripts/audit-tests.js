// scripts/audit-tests.js
// Audit avancé : granularité par composant/page, badge, CSV/JSON, CI fail si modules critiques non couverts
const fs = require('fs');
const path = require('path');

const MODULES = [
  { name: 'Onboarding', keywords: ['Onboarding', 'OnboardingStepper'], critical: true },
  { name: 'Authentification', keywords: ['Auth', 'RequireAuth'], critical: true },
  { name: 'Dashboard Client', keywords: ['ClientDashboard'], critical: true },
  { name: 'Dashboard Chauffeur', keywords: ['ChauffeurDashboard'], critical: true },
  { name: 'Dashboard Admin', keywords: ['AdminDashboard'], critical: true },
  { name: 'Missions', keywords: ['Mission', 'missions', 'MissionList', 'MissionForm'], critical: true },
  { name: 'Facturation', keywords: ['Invoice', 'invoices', 'InvoiceList'], critical: true },
  { name: 'Notifications', keywords: ['Notification', 'NotificationList', 'NotificationToast'], critical: true },
  { name: 'Tracking live', keywords: ['LiveMap', 'MissionTracking', 'chauffeurTracking'], critical: true },
  { name: 'Rôle-requests/modération', keywords: ['admin_role_moderation', 'roleUtils'], critical: true },
  { name: 'Protection des routes', keywords: ['route_protection', 'RequireAuth'], critical: true },
  { name: 'Profil utilisateur', keywords: ['profile', 'ProfileForm'], critical: false },
];

const E2E_DIR = path.join(__dirname, '../cypress/e2e');
const UNIT_DIR = path.join(__dirname, '../tests');
const SRC_COMPONENTS = path.join(__dirname, '../src/components');
const SRC_PAGES = path.join(__dirname, '../src/pages');
const DOC_PATH = path.join(__dirname, '../docs/TEST_AUDIT.md');
const CSV_PATH = path.join(__dirname, '../docs/TEST_AUDIT.csv');
const JSON_PATH = path.join(__dirname, '../docs/TEST_AUDIT.json');
const BADGE_PATH = path.join(__dirname, '../docs/test-coverage-badge.svg');
const README_PATH = path.join(__dirname, '../README.md');

function listFilesRecursive(dir, filter) {
  if (!fs.existsSync(dir)) return [];
  let results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(listFilesRecursive(full, filter));
    } else if (!filter || filter(full)) {
      results.push(full);
    }
  }
  return results;
}

function scanTests() {
  const e2e = listFilesRecursive(E2E_DIR, f => f.endsWith('.cy.ts'));
  const unit = listFilesRecursive(UNIT_DIR, f => f.endsWith('.test.ts') || f.endsWith('.test.tsx'));
  return { e2e, unit };
}

function moduleCoverage(tests) {
  return MODULES.map(mod => {
    const foundE2E = tests.e2e.some(f => mod.keywords.some(k => f.toLowerCase().includes(k.toLowerCase())));
    const foundUnit = tests.unit.some(f => mod.keywords.some(k => f.toLowerCase().includes(k.toLowerCase())));
    return {
      name: mod.name,
      covered: foundE2E || foundUnit,
      types: [foundE2E ? 'E2E' : null, foundUnit ? 'unitaire' : null].filter(Boolean).join(', '),
      critical: !!mod.critical
    };
  });
}

function fileCoverage(files, tests) {
  return files.map(f => {
    const fname = path.basename(f).replace(/\.(tsx|ts|js|jsx)$/, '');
    const foundE2E = tests.e2e.some(t => t.toLowerCase().includes(fname.toLowerCase()));
    const foundUnit = tests.unit.some(t => t.toLowerCase().includes(fname.toLowerCase()));
    return {
      file: path.relative(process.cwd(), f),
      covered: foundE2E || foundUnit,
      types: [foundE2E ? 'E2E' : null, foundUnit ? 'unitaire' : null].filter(Boolean).join(', '),
    };
  });
}

function percent(n, d) {
  return Math.round((n / d) * 100);
}

function badgeSVG(percentage) {
  // Green >80, orange >50, red otherwise
  let color = percentage >= 80 ? 'brightgreen' : percentage >= 50 ? 'orange' : 'red';
  return `https://img.shields.io/badge/tests%20couverture-${percentage}%25-${color}`;
}

function generateBadge(percentage) {
  // Shields.io badge markdown
  return `![Couverture tests](${badgeSVG(percentage)})`;
}

function generateReport() {
  const tests = scanTests();
  const coverage = moduleCoverage(tests);
  const allComponents = listFilesRecursive(SRC_COMPONENTS, f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const allPages = listFilesRecursive(SRC_PAGES, f => f.endsWith('.tsx') || f.endsWith('.ts'));
  const compCoverage = fileCoverage(allComponents, tests);
  const pageCoverage = fileCoverage(allPages, tests);

  // Markdown report
  let md = '# 🧪 Audit de couverture des tests – OneLog Africa\n\n';
  md += `![Couverture tests](${badgeSVG(percent(coverage.filter(m=>m.covered).length, coverage.length))})\n\n`;
  md += '## 1. Couverture des modules et workflows\n\n';
  md += '| Module / Workflow              | Couvert par tests | Type(s) de test(s)        |\n';
  md += '|-------------------------------|:-----------------:|---------------------------|\n';
  for (const mod of coverage) {
    md += `| ${mod.name.padEnd(30)} |   ${mod.covered ? '✅' : '⚠️'}   | ${mod.types || '-'} |\n`;
  }
  md += '\n---\n';
  md += '### Couverture par composant\n';
  md += '| Composant         | Couvert | Type(s) |\n|-------------------|:-------:|---------|\n';
  for (const c of compCoverage) {
    md += `| ${c.file.replace('src/components/', '')} | ${c.covered ? '✅' : '⚠️'} | ${c.types || '-'} |\n`;
  }
  md += '\n---\n';
  md += '### Couverture par page\n';
  md += '| Page              | Couvert | Type(s) |\n|-------------------|:-------:|---------|\n';
  for (const p of pageCoverage) {
    md += `| ${p.file.replace('src/pages/', '')} | ${p.covered ? '✅' : '⚠️'} | ${p.types || '-'} |\n`;
  }

  md += '\n## 2. Fichiers de tests existants\n\n';
  md += '### E2E (Cypress)\n';
  for (const f of tests.e2e) md += `- ${path.relative(process.cwd(), f)}\n`;
  md += '\n### Unitaires (Vitest)\n';
  for (const f of tests.unit) md += `- ${path.relative(process.cwd(), f)}\n`;

  md += '\n## 3. Recommandations & scénarios à ajouter\n\n';
  for (const mod of coverage.filter(m => !m.covered)) {
    md += `- **${mod.name}** :\n  - Ajouter des tests E2E et/ou unitaires pour couvrir ce module.\n`;
  }

  md += '\n---\n';
  md += '\n## Relancer l’audit automatiquement\n';
  md += '\n```sh\nnpm run audit:tests\n```\n';

  fs.writeFileSync(DOC_PATH, md);

  // CSV export
  let csv = 'Module,Type,Couvert,Types\n';
  for (const mod of coverage) {
    csv += `${mod.name},module,${mod.covered ? 'oui' : 'non'},${mod.types}\n`;
  }
  for (const c of compCoverage) {
    csv += `${c.file},composant,${c.covered ? 'oui' : 'non'},${c.types}\n`;
  }
  for (const p of pageCoverage) {
    csv += `${p.file},page,${p.covered ? 'oui' : 'non'},${p.types}\n`;
  }
  fs.writeFileSync(CSV_PATH, csv);

  // JSON export
  fs.writeFileSync(JSON_PATH, JSON.stringify({ modules: coverage, components: compCoverage, pages: pageCoverage }, null, 2));

  // Badge (shields.io markdown in README)
  const badge = generateBadge(percent(coverage.filter(m=>m.covered).length, coverage.length));
  let readme = fs.readFileSync(README_PATH, 'utf-8');
  if (readme.includes('![Couverture tests](')) {
    readme = readme.replace(/!\[Couverture tests\]\([^)]+\)/, badge);
  } else {
    readme = badge + '\n' + readme;
  }
  fs.writeFileSync(README_PATH, readme);

  // CI fail if critical uncovered
  const uncoveredCritical = coverage.filter(m => m.critical && !m.covered);
  if (uncoveredCritical.length) {
    console.error('Modules critiques non couverts :', uncoveredCritical.map(m=>m.name).join(', '));
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log('Audit généré dans docs/TEST_AUDIT.md, CSV et JSON. Badge mis à jour dans README.');
}

generateReport();
