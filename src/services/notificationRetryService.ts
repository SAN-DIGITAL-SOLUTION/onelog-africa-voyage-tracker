import { supabase } from './supabaseClient';
import { notificationService } from './notificationService';
import { checkNotificationPreference } from './notificationService';

// Relance les notifications échouées ou non lues (retry/fallback)
export async function retryFailedNotifications() {
  // 1. Récupérer toutes les notifications échouées ou non lues
  const { data: logs, error } = await supabase
    .from('notification_logs')
    .select('*')
    .or('status.eq.failed,unread.eq.true');

  if (error) throw error;

  for (const log of logs || []) {
    let channelToUse: 'sms' | 'email';
    let reason: string;
    if ((log.retry_count || 0) < 3) {
      channelToUse = 'sms';
      reason = 'retry_sms';
    } else {
      channelToUse = 'email';
      reason = 'fallback_email';
    }
    // Récupérer la notification d'origine
    const { data: notif } = await supabase.from('notifications').select('*').eq('id', log.notification_id).single();
    if (!notif) continue;
    // Vérifier la préférence utilisateur AVANT d'envoyer
    const isAllowed = await checkNotificationPreference(notif.user_id, channelToUse);
    if (!isAllowed) {
      // Log l'événement preference_skipped
      await supabase.from('notification_logs').insert({
        notification_id: log.notification_id,
        user_id: notif.user_id,
        channel: channelToUse,
        status: 'preference_skipped',
        retry_count: (log.retry_count || 0) + 1,
        fallback_channel: channelToUse,
        audit_message: `Canal ${channelToUse} désactivé, retry annulé.`
      });
      continue;
    }
    // Envoyer la notification via le bon canal
    await notificationService.sendCustomNotification({
      type: notif.type || 'fallback',
      channel: channelToUse,
      recipient: notif.user_id,
      userId: notif.user_id,
      variables: { message: notif.message },
      metadata: { fallback_from: log.channel, retry_count: (log.retry_count || 0) + 1 },
    });
    // Log la tentative
    await supabase.from('notification_logs').insert({
      notification_id: log.notification_id,
      user_id: notif.user_id,
      channel: channelToUse,
      status: reason,
      retry_count: (log.retry_count || 0) + 1,
      fallback_channel: channelToUse,
    });
  }
}

// Marque une notification comme lue
export async function markAsRead(notificationId: string, userId: string) {
  await supabase
    .from('notification_logs')
    .update({ unread: false })
    .eq('notification_id', notificationId)
    .eq('user_id', userId);
}

/**
 * Vérifie périodiquement les notifications non lues ou échouées et tente un fallback (SMS/email)
 */
export async function retryUnconfirmedNotifications() {
  // 1. Récupérer les notifications push non lues ou échouées depuis notification_logs
  const { data: logs, error } = await supabase
    .from('notification_logs')
    .select('*')
    .in('status', ['sent', 'failed'])
    .eq('channel', 'push');

  if (error) throw error;

  const now = Date.now();

  for (const log of logs || []) {
    const elapsed = (now - new Date(log.created_at).getTime()) / 1000;
    if (log.status === 'sent' && elapsed > FALLBACK_DELAY_SECONDS) {
      // Fallback si non lu après délai
      await fallbackNotification(log, 'sms');
    } else if (log.status === 'failed' && log.retry_count < 3) {
      // Retry fallback
      await fallbackNotification(log, 'email');
    }
  }
}

async function fallbackNotification(log: any, channel: 'sms' | 'email') {
  // Récupérer la notification d'origine
  const { data: notif } = await supabase.from('notifications').select('*').eq('id', log.notification_id).single();
  if (!notif) return;

  // Vérifier la préférence utilisateur AVANT d'envoyer
  const isAllowed = await checkNotificationPreference(notif.user_id, channel);
  if (!isAllowed) {
    console.log(`[AUDIT] Canal ${channel} désactivé pour l'utilisateur ${notif.user_id}, renvoi annulé (notification ${log.notification_id})`);
    await supabase.from('notification_logs').insert({
      notification_id: log.notification_id,
      user_id: notif.user_id,
      channel,
      status: 'not_sent_pref_disabled',
      retry_count: (log.retry_count || 0) + 1,
      fallback_channel: channel,
      audit_message: `Canal ${channel} désactivé, renvoi annulé.`
    });
    return;
  }

  // Envoyer via le canal fallback
  await notificationService.sendCustomNotification({
    type: 'fallback',
    channel,
    recipient: notif.user_id,
    userId: notif.user_id,
    variables: { message: notif.message },
    metadata: { fallback_from: log.channel }
  });
  // Log l'événement
  await supabase.from('notification_logs').insert({
    notification_id: log.notification_id,
    user_id: notif.user_id,
    channel,
    status: 'fallback_sent',
    retry_count: (log.retry_count || 0) + 1,
    fallback_channel: channel
  });
}
