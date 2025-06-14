
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

// 👉 Un logo générique en base64 (petit carré bleu, changeable par vrai logo plus tard)
// (Ici un SVG rectangle bleu converti, pour l'exemple)
const LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABuUlEQVR4nO2aPYrEMBBFz1AFpK9QJW1FECVtQEAWqrMRgiB5aNBtZUrUqj/6bRHtAk++yFffnS3Mxw0hcWk5ZXM3lnmOfp8Uleh9CWcgqQ5zxp9jiCLqhpzOAjQR36kUwvFaATeAswNJ6A8MCNTFiDMyvSIpgKoDswFiI2YjODjyoGgGeATyBBZNTu5ygj1DkjE9QSLk3J2ytocmpsAgP6TgM8kaBKeN2grkIyxjZbtwPiGXzikrmCMs3pRb3kI2i649w8XWRGQD08uYkmtGANrNsgWIS3v2aH7aRzsMetCD3aNQ3aK418k4tSJxVrAN9iIWBvhlDNvZfExADk5n5ZrfT9QnOEIqNvCvMkBJKPnTdaJ3FQK5EPzsspEhqB+JTruoGreEeCADc8OJEkuk0gfEAlBvmBL3CQpYWGrzLBukQFKOYU8Rt5Br2IH+QEi/TtDBBcQIPacol1QbzuJcV4cKkQO0EkhEsxheRiT+xulu26EcK4xge0o85pi0r4AAAAASUVORK5CYII=";
const LOGO_WIDTH = 64;
const LOGO_HEIGHT = 24;

// CORS headers pour le front
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { missionId } = await req.json();

    // Authentifier la requête via le header Authorization Bearer
    const authHeader = req.headers.get('Authorization') || '';
    const accessToken = authHeader.replace("Bearer ", "").trim();
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }
    const authSupabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } }
    });

    // 1. Récupérer la mission
    const { data: mission, error: missionError } = await authSupabase
      .from("missions")
      .select("*")
      .eq("id", missionId)
      .maybeSingle();

    if (missionError || !mission) {
      return new Response(JSON.stringify({ error: "Mission introuvable ou accès refusé" }), { status: 404, headers: corsHeaders });
    }

    // 2. Chercher le profil utilisateur (si id user présent sur la mission)
    let userProfile = null;
    if (mission.user_id) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", mission.user_id)
        .maybeSingle();
      if (!profileError && profile) userProfile = profile;
    }

    // 3. Générer le PDF moderne
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage([595, 842]);
    let y = 780;
    // Logo
    if (LOGO_BASE64) {
      const logoImg = await pdfDoc.embedPng(Uint8Array.from(atob(LOGO_BASE64), c => c.charCodeAt(0)));
      page.drawImage(logoImg, {
        x: 50, y,
        width: LOGO_WIDTH, height: LOGO_HEIGHT,
      });
    }

    // En-tête "Facture"
    page.drawText("Facture", {
      x: 130, y: y + 8,
      size: 26,
      font: helveticaBold,
      color: rgb(0.02, 0.16, 0.42)
    });

    y -= 40;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0,0.18,0.34) });
    y -= 20;

    // Bloc infos principal
    page.drawText("Informations de la mission :", { x: 50, y, size: 13, font: helveticaBold });
    y -= 18;
    page.drawText(`Client            : ${mission.client ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Chauffeur         : ${mission.chauffeur ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Date officiel     : ${mission.date ? mission.date.toString() : "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Statut mission    : ${mission.status ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;

    // Affichage ref & numéro si présent
    page.drawText(`Référence mission : ${mission.ref ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;

    // Description
    page.drawText("Description :", { x: 60, y, size: 12, font: helveticaBold });
    y -= 12;
    const description = mission.description ?? "Aucune";
    page.drawText(description, { x: 80, y, size: 12, font: helvetica, maxWidth: 460, lineHeight: 13 });

    y -= 32;

    // Section utilisateur
    if (userProfile) {
      page.drawText("Facturé à :", { x: 50, y, size: 12, font: helveticaBold });
      y -= 14;
      page.drawText(
        `${userProfile.first_name ?? ""} ${userProfile.last_name ?? ""}`.trim() || userProfile.id,
        { x: 60, y, size: 12, font: helvetica }
      );
      if (userProfile.phone) {
        y -= 14;
        page.drawText(`Tél : ${userProfile.phone}`, { x: 60, y, size: 12, font: helvetica });
      }
    }

    // Pied de page
    page.drawText(
      "Généré via OneLog Africa le " + (new Date()).toLocaleDateString("fr-FR"),
      { x: 50, y: 60, size: 11, font: helvetica, color: rgb(0.22,0.22,0.22) }
    );

    // 4. Création du PDF binaire
    const pdfBytes = await pdfDoc.save();

    // 5. Upload Storage
    const fileName = `mission_invoice_${mission.id}.pdf`;
    const { error: uploadError } = await supabase
      .storage
      .from("invoices")
      .upload(fileName, new Blob([pdfBytes], { type: "application/pdf" }), { upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Erreur upload : " + uploadError.message }), { status: 500, headers: corsHeaders });
    }

    // 6. Récupère l’URL publique
    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName);
    const pdfUrl = urlData?.publicUrl ?? "";

    return new Response(JSON.stringify({ pdfUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || "Erreur inconnue" }), {
      status: 500, headers: corsHeaders
    });
  }
});

// Helper pour base64 PNG
function atob(str: string): string {
  if (typeof globalThis.atob === "function") return globalThis.atob(str);
  return Buffer.from(str, "base64").toString("binary");
}
