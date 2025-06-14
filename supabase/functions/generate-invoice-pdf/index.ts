
// Edge Function: Generate a PDF for a given invoice, upload to storage, and return the storage public URL

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { v4 as uuidv4 } from "https://esm.sh/uuid@9.0.1";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

// CORS headers for browser usage
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get env vars from Edge context
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { invoice, mission } = await req.json();

    // Minimal PDF generation
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]);
    const fontSizeTitle = 22;
    const fontSizeField = 12;
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Header
    page.drawText("Facture", {
      x: 50, y: 780,
      size: fontSizeTitle,
      font: helveticaBold,
      color: rgb(0, 0.16, 0.39),
    });

    // Facture Details
    const ys = [750, 735, 720, 705, 665, 650, 635, 620];
    page.drawText(`Numéro : ${invoice.number ?? ''}`, { x: 50, y: ys[0], size: fontSizeField, font: helvetica });
    page.drawText(`Référence mission : ${invoice.mission_ref ?? ''}`, { x: 50, y: ys[1], size: fontSizeField, font: helvetica });
    page.drawText(`Date de création : ${invoice.created_at?.slice(0,10) ?? ''}`, { x: 50, y: ys[2], size: fontSizeField, font: helvetica });

    // Mission Info if available
    if (mission) {
      page.drawText(`Client : ${mission.client ?? ''}`, { x: 50, y: ys[3], size: fontSizeField, font: helvetica });
      if (mission.chauffeur) page.drawText(`Chauffeur : ${mission.chauffeur}`, { x: 50, y: ys[4], size: fontSizeField, font: helvetica });
      page.drawText(`Date mission : ${mission.date ?? ''}`, { x: 50, y: ys[5], size: fontSizeField, font: helvetica });
      page.drawText(`Description : ${mission.description ?? ''}`, { x: 50, y: ys[6], size: fontSizeField, font: helvetica });
    }

    // Montant
    page.drawText(`Montant : ${invoice.amount?.toLocaleString()} FCFA`, {
      x: 50, y: ys[7], size: fontSizeField + 2, font: helveticaBold, color: rgb(0, 0.4, 0.07)
    });

    // Générer le PDF binaire
    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const pdfFileName = `invoice_${invoice.id || uuidv4()}.pdf`;
    const { data, error } = await supabase.storage.from("invoices").upload(pdfFileName, new Blob([pdfBytes], {type: "application/pdf"}), { upsert: true });

    if (error) {
      console.error("Upload error", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500, headers: corsHeaders,
      });
    }

    // Get public URL
    const { data: { publicUrl = "" } = {} } = supabase.storage.from("invoices").getPublicUrl(pdfFileName);

    return new Response(JSON.stringify({ url: publicUrl, fileName: pdfFileName }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (e) {
    console.error("Invoice PDF error", e);
    return new Response(JSON.stringify({ error: e.message || "Unknown error" }), {
      status: 500, headers: corsHeaders,
    });
  }
});
