import fs from 'fs';
import path from 'path';
import { TemplateEngine } from '../src/services/templateEngine';

const ROOT = path.join(process.cwd(), 'templates');
const LOG_PATH = path.join(process.cwd(), 'logs', 'test-results.log');
const fakeVars = {
  clientName: 'Test Client',
  missionId: '12345',
  date: '2025-06-23',
  deliveryDate: '2025-06-24',
  amount: '100000',
  currency: 'XOF',
  status: 'En cours',
  content: 'Contenu générique',
};

function walkTemplates(dir: string, relPath = ''): string[] {
  let results: string[] = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    const rel = path.join(relPath, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walkTemplates(full, rel));
    } else if (file.endsWith('.txt') || file.endsWith('.html')) {
      results.push(rel);
    }
  });
  return results;
}

function main() {
  if (!fs.existsSync(path.dirname(LOG_PATH))) fs.mkdirSync(path.dirname(LOG_PATH));
  const templates = walkTemplates(ROOT);
  const logs: string[] = [];
  let ok = 0, fail = 0;
  for (const tpl of templates) {
    const [event, channel, langFile] = tpl.split(path.sep);
    const lang = langFile?.split('.')[0] || 'fr';
    try {
      const output = TemplateEngine.render(event, channel, lang, fakeVars);
      if (/{{.*}}/.test(output)) {
        logs.push(`[WARN] Placeholder non remplacé dans ${tpl}: ${output}`);
        fail++;
      } else {
        logs.push(`[OK] ${tpl}: ${output.replace(/\n/g, ' | ')}`);
        ok++;
      }
    } catch (e) {
      logs.push(`[ERR] ${tpl}: ${e}`);
      fail++;
    }
  }
  fs.writeFileSync(LOG_PATH, logs.join('\n'), 'utf-8');
  console.log(`Validation terminée: ${ok} OK, ${fail} erreurs/warnings. Voir logs/test-results.log`);
}

main();
