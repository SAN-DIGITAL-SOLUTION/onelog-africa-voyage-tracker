// Script Node.js : Génération automatique du plan d’action global à partir des sources de vérité
// Placez ce fichier dans scripts/update-plan-action.js

const fs = require('fs');
const path = require('path');

// Chemins des fichiers sources
const statusPath = path.join(__dirname, '../project-status.json');
const roadmapPath = path.join(__dirname, '../ROADMAP.md');
const auditPath = path.join(__dirname, '../audit-rapport-v1.0.0.md');
const planPath = path.join(__dirname, '../plan-action-global-mvp.md');

// Fonction utilitaire pour lire le JSON de status
function readStatus() {
  try {
    return JSON.parse(fs.readFileSync(statusPath, 'utf-8'));
  } catch (e) {
    return null;
  }
}

// Fonction utilitaire pour extraire les recommandations du rapport d’audit
function extractAuditActions() {
  try {
    const audit = fs.readFileSync(auditPath, 'utf-8');
    const actions = [];
    // Extraction naïve (à améliorer selon la structure du rapport)
    const regex = /Critique\/prioritaire pour la MVP[\s\S]*?Optimisations\/UX[\s\S]*?Sécurité[\s\S]*?Tests à mettre en place[\s\S]*?Prochaines étapes[\s\S]*?([\s\S]*)---/;
    const match = audit.match(regex);
    if (match && match[1]) {
      match[1].split('\n').forEach(line => {
        if (line.trim().startsWith('-') || line.trim().startsWith('•') || line.trim().match(/^\d+\./)) {
          actions.push(line.replace(/^[-•\d.\s]+/, '').trim());
        }
      });
    }
    return actions;
  } catch (e) {
    return [];
  }
}

// Génération du plan d’action Markdown
function generatePlan(actions) {
  let md = `# 🗂️ Plan d’action global – OneLog Africa (MVP)\n\n| ID   | Description succincte | Responsable | Deadline | État initial |\n|------|----------------------|-------------|----------|--------------|\n`;
  actions.forEach((desc, i) => {
    md += `| ${i+1} | ${desc} | À définir | À planifier | À faire |\n`;
  });
  md += `\n---\n\n*Ce fichier est généré automatiquement à partir des recommandations d’audit et de l’état du projet.*\n`;
  return md;
}

function main() {
  const actions = extractAuditActions();
  if (actions.length > 0) {
    const plan = generatePlan(actions);
    fs.writeFileSync(planPath, plan, 'utf-8');
    console.log('Plan d’action global mis à jour.');
  } else {
    console.log('Aucune action extraite du rapport d’audit.');
  }
}

main();
