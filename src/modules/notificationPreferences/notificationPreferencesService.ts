import { supabase } from '../../services/supabaseClient';
import { getUserId } from '../../services/authService';

export async function getNotificationPreferences() {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('id', userId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || {
    email_enabled: true,
    sms_enabled: true,
    whatsapp_enabled: true,
    in_app_enabled: true,
    preferences: {},
  };
}

export async function updateNotificationPreferences(prefs: any) {
  const userId = await getUserId();
  const { error } = await supabase
    .from('notification_preferences')
    .upsert({ ...prefs, id: userId });
  if (error) throw error;
  return true;
}
