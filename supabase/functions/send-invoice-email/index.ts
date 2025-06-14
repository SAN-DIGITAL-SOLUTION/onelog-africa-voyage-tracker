
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// Les secrets
const MAILERSEND_API_TOKEN = Deno.env.get("MAILERSEND_API_TOKEN");
const FROM_EMAIL = "noreply@onelog.africa";
const FROM_NAME = "OneLog Africa";

// Import du client Supabase Edge Function
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseKey);

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

  // Extraction des champs attendus
  const { recipient_email, mission_ref, pdf_url, user_id, mission_id } = requestBody;

  if (!recipient_email || !mission_ref || !pdf_url || !user_id || !mission_id) {
    return new Response(
      JSON.stringify({ error: "Champs requis : recipient_email, mission_ref, pdf_url, user_id, mission_id" }),
      { status: 400, headers: corsHeaders }
    );
  }
  
  // Préparation de l'email
  const subject = "Votre facture OneLog Africa";
  const html = `
    <p>Bonjour,</p>
    <p>Veuillez trouver ci-joint votre facture pour la mission référencée <strong>${mission_ref}</strong>.</p>
    <p>Vous pouvez télécharger votre facture PDF ici : <a href="${pdf_url}">${pdf_url}</a></p>
    <br>
    <p>Merci pour votre confiance.<br>– L'équipe OneLog Africa</p>
  `;
  const text = `Bonjour,

Veuillez trouver ci-joint votre facture pour la mission référencée ${mission_ref}.

Lien de téléchargement PDF : ${pdf_url}

Merci pour votre confiance.
– L'équipe OneLog Africa`;

  // On log uniquement (jamais bloque)
  async function logEmail(status: "success" | "error", errorMessage: string | null, mailerRes?: any) {
    // Ne pas arrêter la transaction sur une erreur de log
    try {
      const { error } = await supabase.from("email_logs").insert({
        user_id,
        mission_id,
        email_to: recipient_email,
        subject,
        body: html,
        status,
        error_message: errorMessage,
        created_at: new Date().toISOString(),
      });
      if (error) {
        console.error("[send-invoice-email][logging] Echec insertion log", error);
      }
    } catch (err) {
      console.error("[send-invoice-email][logging] Exception log", err);
    }
  }

  // Envoi via MailerSend
  try {
    if (!MAILERSEND_API_TOKEN) {
      throw new Error("Clé API MailerSend manquante (MAILERSEND_API_TOKEN)");
    }

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
        html,
        text,
      }),
    });

    const mailJson = await mailRes.json();

    // LOG TOUT
    console.log("[send-invoice-email] Payload:", { recipient_email, mission_ref, pdf_url, user_id, mission_id });
    console.log("[send-invoice-email] Response MailerSend:", mailJson);

    if (!mailRes.ok) {
      await logEmail("error", JSON.stringify(mailJson && mailJson.errors ? mailJson.errors : mailJson), mailJson);
      return new Response(JSON.stringify({
        error: "Envoi échoué",
        mailerSend: mailJson,
      }), { status: 500, headers: corsHeaders });
    }

    // Succès : on log aussi
    await logEmail("success", null, mailJson);

    return new Response(JSON.stringify({
      success: true,
      message: "Email envoyé avec succès",
      mailerSend: mailJson,
    }), { status: 200, headers: corsHeaders });
    
  } catch (e: any) {
    console.error("[send-invoice-email] ERROR:", e);
    await logEmail("error", e.message || "Erreur inconnue");
    return new Response(
      JSON.stringify({ error: e.message || "Erreur inconnue" }),
      { status: 500, headers: corsHeaders }
    );
  }
});
