import fs from 'fs';
import path from 'path';

/**
 * Génère automatiquement des templates pour un nouvel événement, canal ou langue.
 * Usage : node scripts/generate-templates.js --event mission/closed --channels whatsapp,sms,email --langs fr,en
 */
const ROOT = path.join(process.cwd(), 'templates');

const DEFAULTS = {
  whatsapp: {
    fr: 'Bonjour {{clientName}}, votre mission {{missionId}} a été clôturée. Merci d\'avoir utilisé OneLog Africa.',
    en: 'Hello {{clientName}}, your mission {{missionId}} has been closed. Thank you for using OneLog Africa.'
  },
  sms: {
    fr: 'Mission {{missionId}} clôturée. Merci.',
    en: 'Mission {{missionId}} closed. Thank you.'
  },
  email: {
    fr: '<html><body><p>Bonjour <b>{{clientName}}</b>,</p><p>Votre mission <b>#{{missionId}}</b> a été clôturée.</p><p>Merci pour votre confiance.<br/>L\'équipe OneLog Africa</p></body></html>',
    en: '<html><body><p>Hello <b>{{clientName}}</b>,</p><p>Your mission <b>#{{missionId}}</b> has been closed.</p><p>Thank you for your trust.<br/>The OneLog Africa team</p></body></html>'
  }
};

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function generateTemplates(event: string, channels: string[], langs: string[]) {
  for (const channel of channels) {
    for (const lang of langs) {
      const ext = channel === 'email' ? 'html' : 'txt';
      const dir = path.join(ROOT, ...event.split('/'), channel);
      ensureDir(dir);
      const file = path.join(dir, `${lang}.${ext}`);
      if (!fs.existsSync(file)) {
        const content = DEFAULTS[channel]?.[lang] || `Template for ${event} (${channel}, ${lang})`;
        fs.writeFileSync(file, content, 'utf-8');
        console.log(`Créé : ${file}`);
      } else {
        console.log(`Déjà présent : ${file}`);
      }
    }
  }
}

// Simple CLI parser
const args = process.argv.slice(2);
let event = '', channels: string[] = [], langs: string[] = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--event') event = args[++i];
  if (args[i] === '--channels') channels = args[++i].split(',');
  if (args[i] === '--langs') langs = args[++i].split(',');
}
if (!event || !channels.length || !langs.length) {
  console.error('Usage: node scripts/generate-templates.js --event mission/closed --channels whatsapp,sms,email --langs fr,en');
  process.exit(1);
}
generateTemplates(event, channels, langs);
