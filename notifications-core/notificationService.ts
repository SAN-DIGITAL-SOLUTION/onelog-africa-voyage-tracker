import { TemplateEngine } from './templateEngine';
import { getConfig } from './config';

// Type générique pour la notification
export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | string;
export type NotificationType = string;

export interface SendNotificationOptions {
  type: NotificationType;
  recipient: string;
  channel: NotificationChannel;
  variables: Record<string, any>;
  metadata?: Record<string, any>;
  lang?: string;
  senderFn?: (recipient: string, content: string, options: any) => Promise<any>; // fonction d’envoi custom (Twilio, SMTP...)
}

/**
 * Service générique d’envoi de notifications multicanal/multilingue
 * - Utilise TemplateEngine pour le rendu
 * - Appelle une fonction d’envoi (Twilio, SMTP, etc.) injectée
 */
export async function sendNotification(options: SendNotificationOptions): Promise<{ success: boolean; error?: string }> {
  const { type, recipient, channel, variables, lang, senderFn, metadata = {} } = options;
  const l = lang || variables.lang || getConfig().fallbackLang;
  let content = '';
  try {
    content = TemplateEngine.render(type.replace('_', '/'), channel, l, variables);
    if (typeof senderFn === 'function') {
      await senderFn(recipient, content, { type, channel, metadata });
    } else {
      // Par défaut, log en console (pour tests/démo)
      console.log(`[NOTIF][${channel}] ${recipient}: ${content}`);
    }
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
