
import { FileText, Download } from "lucide-react";

export default function Invoices() {
  return (
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
          <tr>
            <td className="py-2 px-3">F-20250017</td>
            <td className="py-2 px-3">MISS-230018</td>
            <td className="py-2 px-3">320 000 FCFA</td>
            <td className="py-2 px-3">
              <span className="bg-onelog-citron/60 text-onelog-nuit px-2 py-1 rounded text-sm font-semibold">
                Payée
              </span>
            </td>
            <td className="py-2 px-3">
              <a
                className="flex items-center gap-1 underline text-onelog-bleu"
                href="#"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FileText size={16} />
                PDF
              </a>
            </td>
          </tr>
        </tbody>
      </table>
      <div className="mt-6 text-right">
        <button className="bg-onelog-citron text-onelog-nuit font-bold px-4 py-2 rounded hover:scale-105 transition-all">
          Générer une facture
        </button>
      </div>
    </main>
  );
}
