import fs from 'fs';
import path from 'path';

/**
 * TemplateEngine: Reads a notification template, replaces placeholders, and returns the final message.
 * Usage: TemplateEngine.render('mission/created', 'whatsapp', 'fr', {clientName: 'Jean'})
 */
export class TemplateEngine {
  static getTemplatePath(event: string, channel: string, lang: string) {
    return path.join(process.cwd(), 'templates', event, channel, `${lang}.txt`);
  }

  static render(event: string, channel: string, lang: string, variables: Record<string, string>): string {
    const templatePath = this.getTemplatePath(event, channel, lang);
    let template: string;
    if (fs.existsSync(templatePath)) {
      template = fs.readFileSync(templatePath, 'utf-8');
    } else {
      // Fallback: chercher un template générique pour le canal/langue
      const fallbackPaths = [
        path.join(process.cwd(), 'templates', 'default', channel, `${lang}.txt`),
        path.join(process.cwd(), 'templates', 'default', channel, 'fr.txt'),
        path.join(process.cwd(), 'templates', 'default', 'global.txt'),
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

// Exemple d'utilisation :
// const msg = TemplateEngine.render('mission/created', 'whatsapp', 'fr', {clientName: 'Jean'});
// console.log(msg);
