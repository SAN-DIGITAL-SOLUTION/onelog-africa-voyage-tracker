import fs from 'fs';
import path from 'path';
import { getConfig } from './config';

const { templatesPath } = getConfig();
const OUTDIR = path.join(__dirname, 'examples');
if (!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR);

function walkTemplates(dir: string, relPath = ''): string[][] {
  let results: string[][] = [];
  fs.readdirSync(dir).forEach(file => {
    const full = path.join(dir, file);
    const rel = path.join(relPath, file);
    if (fs.statSync(full).isDirectory()) {
      results = results.concat(walkTemplates(full, rel));
    } else if (file.endsWith('.txt') || file.endsWith('.html')) {
      // [event, channel, lang]
      const parts = rel.split(path.sep);
      if (parts.length >= 3) {
        const event = parts.slice(0, -2).join('/');
        const channel = parts[parts.length - 2];
        const lang = parts[parts.length - 1].split('.')[0];
        results.push([event, channel, lang]);
      }
    }
  });
  return results;
}

function exampleContent(event: string, channel: string, lang: string) {
  return `// Exemple d'intégration notifications-core pour l'événement "${event}"\nimport { sendNotification } from '../notificationService';\n\n(async () => {\n  const result = await sendNotification({\n    type: '${event}',\n    channel: '${channel}',\n    recipient: 'test@example.com',\n    variables: {\n      clientName: 'Alice',\n      missionId: 'A123',\n      date: '2025-06-23',\n    },\n    lang: '${lang}',\n    // senderFn: (recipient, content, opts) => ...\n  });\n  console.log(result);\n})();\n`;
}

function main() {
  const templates = walkTemplates(templatesPath);
  for (const [event, channel, lang] of templates) {
    const fname = `${event.replace(/[\/]/g, '_')}_${channel}_${lang}.ts`;
    const fpath = path.join(OUTDIR, fname);
    fs.writeFileSync(fpath, exampleContent(event, channel, lang), 'utf-8');
  }
  console.log(`Exemples générés dans ${OUTDIR}`);
}

main();
