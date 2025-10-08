import fs from 'fs';
import path from 'path';
import { getConfig } from './config';

/**
 * TemplateEngine: Reads a notification template, replaces placeholders, and returns the final message.
 * Usage: TemplateEngine.render('mission/created', 'whatsapp', 'fr', {clientName: 'Jean'})
 */
export class TemplateEngine {
  static getTemplatePath(event: string, channel: string, lang: string) {
    const { templatesPath } = getConfig();
    return path.join(templatesPath, ...event.split('/'), channel, `${lang}.${channel === 'email' ? 'html' : 'txt'}`);
  }

  static render(event: string, channel: string, lang: string, variables: Record<string, string>): string {
    const { templatesPath, fallbackLang } = getConfig();
    const templatePath = this.getTemplatePath(event, channel, lang);
    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      // Fallback: chercher un template générique pour le canal/langue
      const fallbackPaths = [
        path.join(templatesPath, 'default', channel, `${lang}.${channel === 'email' ? 'html' : 'txt'}`),
        path.join(templatesPath, 'default', channel, `${fallbackLang}.${channel === 'email' ? 'html' : 'txt'}`),
        path.join(templatesPath, 'default', 'global.txt'),
      ];
      const found = fallbackPaths.find(p => fs.existsSync(p));
      if (found) {
        template = fs.readFileSync(found, 'utf-8');
      } else {
        template = 'Notification: {{content}}'; // fallback ultime
      }
    }
    // Remplacement des placeholders {{var}}
    template = template.replace(/{{\s*([a-zA-Z0-9_]+)\s*}}/g, (_, key) => variables[key] || '');
    return template;
  }
}
