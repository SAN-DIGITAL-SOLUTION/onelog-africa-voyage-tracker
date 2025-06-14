
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const LOGO_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABuUlEQVR4nO2aPYrEMBBFz1AFpK9QJW1FECVtQEAWqrMRgiB5aNBtZUrUqj/6bRHtAk++yFffnS3Mxw0hcWk5ZXM3lnmOfp8Uleh9CWcgqQ5zxp9jiCLqhpzOAjQR36kUwvFaATeAswNJ6A8MCNTFiDMyvSIpgKoDswFiI2YjODjyoGgGeATyBBZNTu5ygj1DkjE9QSLk3J2ytocmpsAgP6TgM8kaBKeN2grkIyxjZbtwPiGXzikrmCMs3pRb3kI2i649w8XWRGQD08uYkmtGANrNsgWIS3v2aH7aRzsMetCD3aNQ3aK418k4tSJxVrAN9iIWBvhlDNvZfExADk5n5ZrfT9QnOEIqNvCvMkBJKPnTdaJ3FQK5EPzsspEhqB+JTruoGreEeCADc8OJEkuk0gfEAlBvmBL3CQpYWGrzLBukQFKOYU8Rt5Br2IH+QEi/TtDBBcQIPacol1QbzuJcV4cKkQO0EkhEsxheRiT+xulu26EcK4xge0o85pi0r4AAAAASUVORK5CYII=";
const LOGO_WIDTH = 64;
const LOGO_HEIGHT = 24;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { invoice, mission } = await req.json();
    if (!invoice) {
      return new Response(
        JSON.stringify({ error: "Missing invoice input." }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Get mission, either directly or by mission_ref
    let missionData = mission;
    if (!missionData && invoice.mission_ref) {
      const { data } = await supabase
        .from("missions")
        .select("*")
        .eq("ref", invoice.mission_ref)
        .maybeSingle();
      missionData = data;
    }

    // Optionally: fetch user profile for invoice.user_id
    let userProfile: any = null;
    if (invoice.user_id) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", invoice.user_id)
        .maybeSingle();
      userProfile = profile;
    }

    // Generate PDF for the invoice
    const pdfDoc = await PDFDocument.create();
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage([595, 842]);
    let y = 780;

    // Logo
    if (LOGO_BASE64) {
      const logoImg = await pdfDoc.embedPng(Uint8Array.from(atob(LOGO_BASE64), c => c.charCodeAt(0)));
      page.drawImage(logoImg, { x: 50, y, width: LOGO_WIDTH, height: LOGO_HEIGHT });
    }

    // Title
    page.drawText("Facture", {
      x: 130, y: y + 8,
      size: 26,
      font: helveticaBold,
      color: rgb(0.02, 0.16, 0.42)
    });

    y -= 40;
    page.drawLine({ start: { x: 50, y }, end: { x: 545, y }, thickness: 1, color: rgb(0,0.18,0.34) });
    y -= 20;

    // Invoice Info
    page.drawText("Informations facture :", { x: 50, y, size: 13, font: helveticaBold });
    y -= 18;
    page.drawText(`Numéro facture  : ${invoice.number}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Montant (FCFA)  : ${invoice.amount?.toLocaleString?.() ?? invoice.amount ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Statut facture  : ${invoice.status ?? "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    page.drawText(`Date création   : ${invoice.created_at ? new Date(invoice.created_at).toLocaleDateString("fr-FR") : "N/A"}`, { x: 60, y, size: 12, font: helvetica });
    y -= 16;
    if (missionData?.ref) {
      page.drawText(`Réf. mission    : ${missionData.ref}`, { x: 60, y, size: 12, font: helvetica });
      y -= 16;
    }
    if (missionData?.client) {
      page.drawText(`Client          : ${missionData.client}`, { x: 60, y, size: 12, font: helvetica });
      y -= 16;
    }
    if (missionData?.chauffeur) {
      page.drawText(`Chauffeur       : ${missionData.chauffeur}`, { x: 60, y, size: 12, font: helvetica });
      y -= 16;
    }
    if (missionData?.date) {
      page.drawText(`Date mission    : ${missionData.date}`, { x: 60, y, size: 12, font: helvetica });
      y -= 16;
    }

    // Description
    if (missionData?.description) {
      page.drawText("Description :", { x: 60, y, size: 12, font: helveticaBold });
      y -= 12;
      page.drawText(missionData.description, { x: 80, y, size: 12, font: helvetica, maxWidth: 460, lineHeight: 13 });
      y -= 18;
    }

    // Profile
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
      y -= 10;
    }

    // Footer
    page.drawText(
      "Généré via OneLog Africa le " + (new Date()).toLocaleDateString("fr-FR"),
      { x: 50, y: 60, size: 11, font: helvetica, color: rgb(0.22,0.22,0.22) }
    );

    // Save and upload
    const pdfBytes = await pdfDoc.save();
    const fileName = `invoice_${invoice.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("invoices")
      .upload(fileName, new Blob([pdfBytes], { type: "application/pdf" }), { upsert: true });

    if (uploadError) {
      return new Response(JSON.stringify({ error: "Erreur upload : " + uploadError.message }), { status: 500, headers: corsHeaders });
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from("invoices").getPublicUrl(fileName);
    const pdfUrl = urlData?.publicUrl ?? "";

    // Patch the invoice row with the PDF URL if not set already
    if (pdfUrl) {
      await supabase
        .from("invoices")
        .update({ pdf_url: pdfUrl })
        .eq("id", invoice.id);
    }

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
