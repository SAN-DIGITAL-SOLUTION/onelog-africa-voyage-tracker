// Script Node.js : Génération automatique des plans segmentés par rôle à partir du plan global
// Placez ce fichier dans scripts/update-plan-segmented.js

const fs = require('fs');
const path = require('path');

const planGlobalPath = path.join(__dirname, '../plan-action-global-mvp.md');
const segmentedPath = path.join(__dirname, '../plans/plan-segmented.md');

// Association simple tâches <-> rôles (à adapter selon votre logique métier)
const roleKeywords = {
  client: [
    'Missions', 'Facturation', 'notifications', 'feedback visuel', 'accessibilité', 'navigation', 'workflow', 'Cypress', 'tests unitaires'
  ],
  chauffeur: [
    'Missions', 'notifications', 'workflow', 'tests', 'navigation', 'feedback visuel', 'accessibilité'
  ],
  exploitant: [
    'dashboard admin', 'documentation', 'RLS', 'droits', 'formation', 'RGPD', 'suppression des données'
  ],
  admin: [
    'dépendances', 'monitoring', 'alerting', 'production', 'CI/CD', 'QA', 'bundle JS', 'Sentry', 'logs', 'admin'
  ]
};

// Parse le tableau du plan global
function parseGlobalPlan(md) {
  const lines = md.split('\n');
  const tasks = [];
  for (const line of lines) {
    if (line.startsWith('|') && !line.includes('Description')) {
      const cols = line.split('|').map(col => col.trim());
      if (cols.length >= 6) {
        tasks.push({
          id: cols[1],
          desc: cols[2],
          resp: cols[3],
          deadline: cols[4],
          status: cols[5]
        });
      }
    }
  }
  return tasks;
}

// Attribue chaque tâche à un ou plusieurs rôles
function segmentTasks(tasks) {
  const segments = { client: [], chauffeur: [], exploitant: [], admin: [] };
  for (const task of tasks) {
    for (const [role, keywords] of Object.entries(roleKeywords)) {
      for (const kw of keywords) {
        if (task.desc.toLowerCase().includes(kw.toLowerCase())) {
          segments[role].push(task);
          break;
        }
      }
    }
  }
  // Suppression des doublons par rôle (par ID)
  for (const role of Object.keys(segments)) {
    const seen = new Set();
    segments[role] = segments[role].filter(t => {
      if (seen.has(t.id)) return false;
      seen.add(t.id);
      return true;
    });
  }
  return segments;
}

function generateSegmentedMarkdown(segments) {
  let md = '# 📋 Plans d’action segmentés par rôle\n\n';
  for (const role of ['client', 'chauffeur', 'exploitant', 'admin']) {
    md += `## ${role.charAt(0).toUpperCase() + role.slice(1)}\n\n`;
    md += '| ID  | Tâche                                   | Responsable | Échéance | Statut |\n';
    md += '|-----|-----------------------------------------|-------------|----------|--------|\n';
    segments[role].forEach(t => {
      md += `| ${t.id} | ${t.desc} | ${t.resp} | ${t.deadline} | ${t.status} |\n`;
    });
    md += '\n';
  }
  return md;
}

function main() {
  if (!fs.existsSync(planGlobalPath)) {
    console.error('Le plan global est introuvable.');
    process.exit(1);
  }
  const md = fs.readFileSync(planGlobalPath, 'utf-8');
  const tasks = parseGlobalPlan(md);
  const segments = segmentTasks(tasks);
  const segMd = generateSegmentedMarkdown(segments);
  fs.writeFileSync(segmentedPath, segMd, 'utf-8');
  console.log('Plan segmenté mis à jour.');
}

main();
