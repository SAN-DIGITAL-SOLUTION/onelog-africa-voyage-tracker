// Supabase Edge Function: update-notification-preferences
import { serve } from 'std/server';
import { createClient } from 'supabase-lib';

serve(async (req) => {
  const supabase = createClient();
  const { user } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const body = await req.json();
  const { email_enabled, sms_enabled, whatsapp_enabled, in_app_enabled, preferences } = body;

  const { error } = await supabase.from('notification_preferences').upsert({
    id: user.id,
    email_enabled,
    sms_enabled,
    whatsapp_enabled,
    in_app_enabled,
    preferences: preferences || {}
  });
  if (error) return new Response(error.message, { status: 400 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
});
