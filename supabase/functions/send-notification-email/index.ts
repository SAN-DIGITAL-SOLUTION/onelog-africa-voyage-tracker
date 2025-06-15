
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// MailerSend API token is stored in Supabase secrets
const MAILERSEND_API_TOKEN = Deno.env.get("MAILERSEND_API_TOKEN");
const FROM_EMAIL = "noreply@onelog.africa";
const FROM_NAME = "OneLog Africa";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  let requestBody;
  try {
    requestBody = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Corps JSON invalide" }), {
      status: 400,
      headers: corsHeaders,
    });
  }

  const { recipient_email, message_html, message_text, user_id, mission_id, trigger } = requestBody || {};

  if (!recipient_email || !message_html || !user_id) {
    return new Response(
      JSON.stringify({ error: "Champs requis : recipient_email, message_html, user_id" }),
      { status: 400, headers: corsHeaders }
    );
  }

  if (!MAILERSEND_API_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Clé API MailerSend manquante dans les secrets Supabase" }),
      { status: 500, headers: corsHeaders }
    );
  }

  const subject = trigger
    ? `[OneLog] Nouvelle notification - ${trigger}`
    : `[OneLog] Notification`;

  try {
    const mailRes = await fetch("https://api.mailersend.com/v1/email", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${MAILERSEND_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: { email: FROM_EMAIL, name: FROM_NAME },
        to: [{ email: recipient_email }],
        subject,
        html: message_html,
        text: message_text || "",
      }),
    });

    const mailJson = await mailRes.json();

    // Logging for debug
    console.log("[send-notification-email] Payload:", { recipient_email, user_id, mission_id, trigger });
    console.log("[send-notification-email] Response MailerSend:", mailJson);

    if (!mailRes.ok) {
      return new Response(
        JSON.stringify({
          error: "Envoi échoué via MailerSend",
          mailersend_error: mailJson,
        }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, mailersend_response: mailJson }),
      { status: 200, headers: corsHeaders }
    );
  } catch (e: any) {
    console.error("[send-notification-email] ERROR", e);
    return new Response(
      JSON.stringify({ error: e.message || "Erreur inconnue dans l'envoi email" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
