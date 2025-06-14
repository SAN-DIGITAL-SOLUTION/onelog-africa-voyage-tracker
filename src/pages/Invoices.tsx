import { FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";

export default function Invoices() {
  const { user } = useAuth();

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["invoices", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw new Error(error.message);
      return data || [];
    },
    enabled: !!user,
  });

  // CSV export handler
  const exportCSV = () => {
    if (!invoices?.length) return;
    const headers = ["Numéro", "Mission", "Montant (FCFA)", "Statut", "Date Création"];
    const rows = invoices.map((inv: any) => [
      inv.number,
      inv.mission_ref,
      inv.amount,
      inv.status,
      inv.created_at ? new Date(inv.created_at).toLocaleString() : ""
    ]);
    const csvData =
      [headers, ...rows]
        .map(row => row.map(field =>
          typeof field === "string" && field.includes(",") ? `"${field}"` : field
        ).join(",")).join("\n");
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "factures.csv");
    toast({ title: "Export CSV", description: "Le fichier CSV a été téléchargé !" });
  };

  // PDF generation for a single invoice
  const generatePDF = async (inv: any) => {
    try {
      toast({ title: "Génération PDF…", description: "Veuillez patienter." });
      // Fetch mission for richer content
      let mission = null;
      if (inv.mission_ref) {
        const { data: ms, error } = await supabase
          .from("missions")
          .select("*")
          .eq("ref", inv.mission_ref)
          .maybeSingle();
        if (!error && ms) mission = ms;
      }

      // Call the edge function
      const { data, error } = await supabase.functions.invoke("generate-invoice-pdf", {
        body: { invoice: inv, mission },
      });

      if (error || !data?.url) {
        throw new Error(error?.message || "Impossible de générer le PDF.");
      }
      toast({ title: "PDF généré", description: "Lien PDF prêt à télécharger !" });
      window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Erreur PDF", description: e.message, variant: "destructive" });
    }
  };

  return (
    <RequireAuth>
      <main className="container mx-auto pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Factures</h1>
          <button
            className="flex items-center gap-2 bg-onelog-bleu text-white font-bold px-4 py-2 rounded shadow hover:scale-105 transition-all"
            onClick={exportCSV}
          >
            <Download size={18} /> Exporter CSV
          </button>
        </div>
        <table className="w-full border rounded-lg bg-white shadow-sm">
          <thead>
            <tr className="bg-onelog-bleu/90 text-white">
              <th className="py-2 px-3 text-left">Numéro</th>
              <th className="py-2 px-3 text-left">Mission</th>
              <th className="py-2 px-3 text-left">Montant</th>
              <th className="py-2 px-3 text-left">Statut</th>
              <th className="py-2 px-3 text-left">PDF</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full inline-block" />
                </td>
              </tr>
            ) : invoices && invoices.length > 0 ? (
              invoices.map((inv: any) => (
                <tr key={inv.id}>
                  <td className="py-2 px-3">{inv.number}</td>
                  <td className="py-2 px-3">{inv.mission_ref}</td>
                  <td className="py-2 px-3">{inv.amount?.toLocaleString()} FCFA</td>
                  <td className="py-2 px-3">
                    <span className="bg-onelog-citron/60 text-onelog-nuit px-2 py-1 rounded text-sm font-semibold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    {/* PDF download: use pdf_url field, else show button */}
                    {inv.pdf_url ? (
                      <a
                        className="flex items-center gap-1 underline text-onelog-bleu"
                        href={inv.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FileText size={16} />
                        PDF
                      </a>
                    ) : (
                      <button
                        onClick={() => generatePDF(inv)}
                        className="flex items-center gap-1 text-onelog-nuit underline hover:text-onelog-bleu"
                        title="Générer PDF"
                      >
                        <FileText size={16} />
                        Générer
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-8 text-onelog-nuit/60">
                  Aucune facture trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="mt-6 text-right">
          <button className="bg-onelog-citron text-onelog-nuit font-bold px-4 py-2 rounded hover:scale-105 transition-all">
            Générer une facture
          </button>
        </div>
      </main>
    </RequireAuth>
  );
}
