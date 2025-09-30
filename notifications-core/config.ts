// Configuration centrale du module notifications-core
export function getConfig() {
  return {
    templatesPath: process.env.NOTIFCORE_TEMPLATES_PATH || require('path').join(process.cwd(), 'notifications-core', 'templates'),
    fallbackLang: process.env.NOTIFCORE_FALLBACK_LANG || 'fr',
    channels: (process.env.NOTIFCORE_CHANNELS || 'whatsapp,sms,email').split(','),
    langs: (process.env.NOTIFCORE_LANGS || 'fr,en').split(','),
  };
}
