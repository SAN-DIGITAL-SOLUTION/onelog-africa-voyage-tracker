import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { PDFDocument, StandardFonts, rgb } from 'npm:pdf-lib@1.17.1';

const LOGO_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAABuUlEQVR4nO2aPYrEMBBFz1AFpK9QJW1FECVtQEAWqrMRgiB5aNBtZUrUqj/6bRHtAk++yFffnS3Mxw0hcWk5ZXM3lnmOfp8Uleh9CWcgqQ5zxp9jiCLqhpzOAjQR36kUwvFaATeAswNJ6A8MCNTFiDMyvSIpgKoDswFiI2YjODjyoGgGeATyBBZNTu5ygj1DkjE9QSLk3J2ytocmpsAgP6TgM8kaBKeN2grkIyxjZbtwPiGXzikrmCMs3pRb3kI2i649w8XWRGQD08uYkmtGANrNsgWIS3v2aH7aRzsMetCD3aNQ3aK418k4tSJxVrAN9iIWBvhlDNvZfExADk5n5ZrfT9QnOEIqNvCvMkBJKPnTdaJ3FQK5EPzsspEhqB+JTruoGreEeCADc8OJEkuk0gfEAlBvmBL3CQpYWGrzLBukQFKOYU8Rt5Br2IH+QEi/TtDBBcQIPacol1QbzuJcV4cKkQO0EkhEsxheRiT+xulu26EcK4xge0o85pi0r4AAAAASUVORK5CYII=';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { billing_partner_id, start_date, end_date } = await req.json();

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);

    // 1. Récupérer les informations du partenaire de facturation
    const { data: partner, error: partnerError } = await supabase
      .from('billing_partners')
      .select('*')
      .eq('id', billing_partner_id)
      .single();

    if (partnerError || !partner) {
      throw new Error('Partenaire de facturation introuvable.');
    }

    // 2. Récupérer les missions terminées dans l'intervalle
    const { data: missions, error: missionsError } = await supabase
      .from('missions')
      .select('id, reference, date_fin_reelle, cout_total')
      .eq('billing_partner_id', billing_partner_id)
      .eq('statut', 'terminee')
      .gte('date_fin_reelle', start_date)
      .lte('date_fin_reelle', end_date);

    if (missionsError) throw missionsError;
    if (!missions || missions.length === 0) {
      throw new Error('Aucune mission facturable trouvée pour cette période.');
    }

    // 3. Générer le PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // En-tête
    page.drawText('FACTURE GROUPÉE', { x: 50, y: height - 50, font: boldFont, size: 24 });
    page.drawText(`Client: ${partner.name}`, { x: 50, y: height - 80, font: boldFont, size: 16 });
    page.drawText(`Période du ${start_date} au ${end_date}`, { x: 50, y: height - 100, font, size: 12 });

    // Tableau des missions
    let yPosition = height - 150;
    page.drawText('Réf. Mission', { x: 50, y: yPosition, font: boldFont });
    page.drawText('Date de fin', { x: 200, y: yPosition, font: boldFont });
    page.drawText('Montant', { x: width - 100, y: yPosition, font: boldFont });
    yPosition -= 20;

    let totalAmount = 0;
    for (const mission of missions) {
      page.drawText(mission.reference, { x: 50, y: yPosition, font });
      page.drawText(new Date(mission.date_fin_reelle).toLocaleDateString(), { x: 200, y: yPosition, font });
      page.drawText(`${mission.cout_total.toFixed(2)} €`, { x: width - 100, y: yPosition, font });
      yPosition -= 15;
      totalAmount += mission.cout_total;
    }

    // Total
    yPosition -= 20;
    page.drawLine({ start: { x: 50, y: yPosition }, end: { x: width - 50, y: yPosition }, thickness: 1 });
    yPosition -= 20;
    page.drawText('TOTAL', { x: width - 200, y: yPosition, font: boldFont, size: 14 });
    page.drawText(`${totalAmount.toFixed(2)} €`, { x: width - 100, y: yPosition, font: boldFont, size: 14 });

    const pdfBytes = await pdfDoc.save();

    // 4. Stocker le PDF
    const fileName = `invoices/grouped-${billing_partner_id}-${Date.now()}.pdf`;
    const { error: uploadError } = await supabase.storage.from('invoices').upload(fileName, pdfBytes, { contentType: 'application/pdf', upsert: true });
    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('invoices').getPublicUrl(fileName);

    return new Response(JSON.stringify({ pdfUrl: publicUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
