
import { FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";

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

  return (
    <RequireAuth>
      <main className="container mx-auto pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Factures</h1>
          <button className="flex items-center gap-2 bg-onelog-bleu text-white font-bold px-4 py-2 rounded shadow hover:scale-105 transition-all">
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
                      <span className="text-onelog-nuit/60">N/A</span>
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
