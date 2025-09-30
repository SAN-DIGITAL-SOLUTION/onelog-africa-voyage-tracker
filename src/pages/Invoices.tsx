import { FileText, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from '@/integrations/supabase/client';
import RequireAuth from "@/components/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { saveAs } from "file-saver";
import { SlideDownHeader } from "@/components/SlideDownHeader";
import { CardFade } from "@/components/CardFade";
import { AnimatedAfrica } from "@/components/AnimatedAfrica";
import "@/styles/animations.css";

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
      <div className="min-h-full bg-gradient-to-br from-gray-50 to-green-50">
        <main className="w-full max-w-none px-4 sm:px-6 lg:px-8 py-6">
          {/* Header avec design amélioré */}
          <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 border border-gray-100">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Facturation</h1>
                  <p className="text-gray-600 text-lg">
                    Gérez vos factures et exportez vos données comptables
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                <button
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={exportCSV}
                >
                  <Download size={18} />
                  Exporter CSV
                </button>
                <button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
                  <FileText size={18} className="mr-2" />
                  Nouvelle facture
                </button>
              </div>
            </div>
            
            {/* Stats rapides */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Payées</p>
                    <p className="text-xl font-bold text-green-800">{invoices?.filter(inv => inv.status === 'paid').length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-4 rounded-xl border border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">En attente</p>
                    <p className="text-xl font-bold text-orange-800">{invoices?.filter(inv => inv.status === 'pending').length || 0}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Montant total</p>
                    <p className="text-xl font-bold text-blue-800">
                      {invoices?.reduce((sum, inv) => sum + (inv.amount || 0), 0).toLocaleString() || 0} FCFA
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total factures</p>
                    <p className="text-xl font-bold text-purple-800">{invoices?.length || 0}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table avec design amélioré */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6 sm:mb-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Numéro</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Mission</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Montant</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Statut</th>
                    <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex items-center justify-center gap-3">
                          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-gray-600 font-medium">Chargement des factures...</span>
                        </div>
                      </td>
                    </tr>
                  ) : invoices && invoices.length > 0 ? (
                    invoices.map((inv: any, index: number) => (
                      <tr key={inv.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="py-4 px-6">
                          <div className="font-mono text-sm font-semibold text-gray-900">{inv.number}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm text-gray-900">{inv.mission_ref}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-sm font-semibold text-gray-900">{inv.amount?.toLocaleString()} FCFA</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            inv.status === 'paid' 
                              ? 'bg-green-100 text-green-800 border border-green-200' 
                              : inv.status === 'pending'
                              ? 'bg-orange-100 text-orange-800 border border-orange-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'En attente' : inv.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          {inv.pdf_url ? (
                            <a
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-150"
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <FileText size={16} />
                              Télécharger PDF
                            </a>
                          ) : (
                            <button
                              onClick={() => generatePDF(inv)}
                              className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 font-medium transition-colors duration-150"
                              title="Générer PDF"
                            >
                              <FileText size={16} />
                              Générer PDF
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-3">
                          <div className="p-4 bg-gray-100 rounded-full">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune facture trouvée</h3>
                            <p className="text-gray-600">Vos factures apparaîtront ici une fois créées</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
