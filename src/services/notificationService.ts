import Twilio from 'twilio';
import fetch from 'node-fetch';
import { supabase } from '@/lib/supabase';
import { TemplateEngine } from './templateEngine';

const whatsappFrom = process.env.TWILIO_WHATSAPP_FROM!;
const smsFrom = process.env.TWILIO_SMS_FROM!;

type NotificationType = 'mission_created' | 'mission_updated' | 'payment_received' | 'delivery_status';

type NotificationChannel = 'email' | 'sms' | 'whatsapp';

type SendNotificationOptions = {
  type: NotificationType;
  recipient: string;
  userId?: string;
  channel: NotificationChannel;
  variables: Record<string, any>;
  metadata?: Record<string, any>;
};

type NotificationPreference = {
  email_enabled: boolean;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  push_enabled: boolean;
};

// Vérifie si l'utilisateur a activé les notifications pour le canal spécifié
async function checkNotificationPreference(
  userId: string,
  channel: NotificationChannel
): Promise<boolean> {
  const { data: preferences, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error || !preferences) {
    console.warn('Préférences de notification non trouvées, utilisation des valeurs par défaut');
    return true; // Par défaut, activé
  }

  switch (channel) {
    case 'email':
      return preferences.email_enabled !== false;
    case 'sms':
      return preferences.sms_enabled !== false;
    case 'whatsapp':
      return preferences.whatsapp_enabled !== false;
    default:
      return true;
  }
}

// Enregistre la notification dans la base de données
async function logNotification(
  options: Omit<SendNotificationOptions, 'type' | 'variables'> & {
    type: string;
    status: 'pending' | 'sent' | 'failed' | 'preference_skipped';
    content: string;
    error?: string;
  }
) {
  const { data, error } = await supabase
    .from('notification_logs')
    .insert([
      {
        type: options.type,
        channel: options.channel,
        status: options.status,
        recipient: options.recipient,
        content: options.content,
        metadata: options.metadata,
        error_message: options.error,
      },
    ])
    .select();

  if (error) {
    console.error('Erreur lors de l\'enregistrement de la notification:', error);
    return null;
  }

  return data?.[0];
}

// Envoie une notification via le canal spécifié
async function sendNotification(
  options: SendNotificationOptions
): Promise<{ success: boolean; error?: string }> {
  const { type, recipient, userId, channel, variables, metadata = {} } = options;

  try {
    // Vérifier les préférences de notification si un userId est fourni
    if (userId) {
      const isEnabled = await checkNotificationPreference(userId, channel);
      if (!isEnabled) {
        console.log(`Les notifications ${channel} sont désactivées pour cet utilisateur`);
        return { success: false, error: 'Notifications désactivées pour ce canal' };
      }
    }

    // Générer dynamiquement le contenu de la notification à partir des templates fichiers (fallback inclus)
    let lang = variables.lang || 'fr';
    let content = '';
    try {
      content = TemplateEngine.render(type.replace('_', '/'), channel, lang, variables);
    } catch (e) {
      // fallback ultime
      content = variables.content || '[Notification envoyée]';
    }

    // Enregistrer la notification comme "en attente"
    const notificationLog = await logNotification({
      type,
      channel,
      recipient,
      userId,
      status: 'pending',
      content,
      metadata,
    });

    if (!notificationLog) {
      throw new Error('Échec de l\'enregistrement de la notification');
    }

    let success = false;
    let error;

    switch (channel) {
      case 'email':
        try {
          await fetch('https://api.mailersend.com/v1/email', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.MAILERSEND_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: { email: process.env.MAILERSEND_SENDER_EMAIL },
              to: [{ email: recipient }],
              subject: `Notification ${type}`,
              text: content,
            }),
          });
          success = true;
        } catch (e) {
          error = e.message;
        }
        break;
      case 'sms':
        try {
          const twilioClient = Twilio(
            process.env.TWILIO_ACCOUNT_SID!,
            process.env.TWILIO_AUTH_TOKEN!
          );
          await twilioClient.messages.create({
            from: smsFrom,
            to: recipient,
            body: content,
          });
          success = true;
        } catch (e) {
          error = e.message;
        }
        break;
      default:
        // Simuler l'envoi (à remplacer par l'intégration réelle avec Twilio, etc.)
        console.log(`Envoi d'une notification ${channel} à ${recipient}:`, content);
        // Simuler un succès après un court délai
        await new Promise((resolve) => setTimeout(resolve, 500));
        success = true;
    }

    // Mettre à jour le statut de la notification
    await logNotification({
      type,
      channel,
      recipient,
      userId,
      status: success ? 'sent' : 'failed',
      content,
      metadata,
      error,
    });

    return { success, error };
  } catch (error: any) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    const errorMessage = error.message || 'Erreur inconnue';
    
    // Enregistrer l'échec
    await logNotification({
      type: options.type,
      channel: options.channel,
      recipient: options.recipient,
      userId: options.userId,
      status: 'failed',
      content: '',
      metadata: options.metadata,
      error: errorMessage,
    });
    
    return { success: false, error: errorMessage };
  }
}

// Fonction pour envoyer une notification SMS (placeholder)
async function sendSMSNotification(
  notification: any,
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  // Placeholder pour l'intégration SMS
  console.log(`SMS to ${phoneNumber}: ${message}`);
  
  const { error } = await supabase
    .from('notifications')
    .update({ 
      status: 'sent',
      sent_at: new Date().toISOString() 
    })
    .eq('id', notification.id);

  if (error) {
    console.error('Erreur lors de la mise à jour de la notification:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Fonction pour envoyer une notification personnalisée
export async function sendCustomNotification(
  type: NotificationType,
  channel: NotificationChannel,
  recipient: string,
  variables: Record<string, any>,
  userId?: string,
  metadata?: Record<string, any>
): Promise<{ success: boolean; error?: string }> {
  return sendNotification({
    type,
    channel,
    recipient,
    userId,
    variables,
    metadata,
  });
}

export { sendNotification, checkNotificationPreference, logNotification };
