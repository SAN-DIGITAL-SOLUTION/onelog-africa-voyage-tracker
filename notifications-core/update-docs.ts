import fs from 'fs';
import path from 'path';
import { getConfig } from './config';

const README = path.join(__dirname, 'README.md');
const { templatesPath } = getConfig();

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

function uniq(arr: string[]) {
  return Array.from(new Set(arr));
}

function updateReadme() {
  const templates = walkTemplates(templatesPath);
  const events = uniq(templates.map(t => t[0])).sort();
  const channels = uniq(templates.map(t => t[1])).sort();
  const langs = uniq(templates.map(t => t[2])).sort();

  let readme = fs.readFileSync(README, 'utf-8');

  // Remplace ou insère la section dynamique
  const markerStart = '<!-- AUTO-TEMPLATES-START -->';
  const markerEnd = '<!-- AUTO-TEMPLATES-END -->';
  const table = `\n| Événement | Canaux disponibles | Langues disponibles |\n|-----------|-------------------|---------------------|\n${events.map(ev => `| ${ev} | ${channels.join(', ')} | ${langs.join(', ')} |`).join('\n')}\n`;

  const content = `${markerStart}\n${table}\n${markerEnd}`;
  if (readme.includes(markerStart) && readme.includes(markerEnd)) {
    readme = readme.replace(new RegExp(`${markerStart}[\s\S]*${markerEnd}`), content);
  } else {
    // Ajoute à la fin si pas présent
    readme += `\n\n${content}`;
  }
  fs.writeFileSync(README, readme, 'utf-8');
  console.log('README.md mis à jour avec la liste des événements/canaux/langues.');
}

updateReadme();
