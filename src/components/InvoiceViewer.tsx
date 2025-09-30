import { useEffect, useState } from 'react';
import { getInvoices, exportInvoicesPDF, exportInvoicesCSV, sendInvoiceByEmail } from '../services/invoices';

export default function InvoiceViewer() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getInvoices()
      .then(data => setInvoices(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement des factures...</div>;
  if (error) return <div>Erreur : {error}</div>;
  if (!invoices.length) return <div>Aucune facture trouvée.</div>;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button onClick={() => exportInvoicesPDF(invoices)} className="btn">Exporter PDF</button>
        <button onClick={() => exportInvoicesCSV(invoices)} className="btn">Exporter CSV</button>
      </div>
      <table className="table-auto w-full border">
        <thead>
          <tr>
            <th>ID</th>
            <th>Date</th>
            <th>Client</th>
            <th>Montant</th>
            <th>Envoyer par email</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map(inv => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.date}</td>
              <td>{inv.client_name}</td>
              <td>{inv.amount} €</td>
              <td>
                <button onClick={() => sendInvoiceByEmail(inv.id)} className="btn btn-sm">Envoyer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
