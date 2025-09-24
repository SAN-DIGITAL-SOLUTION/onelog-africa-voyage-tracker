// fichier: src/components/InvoiceList.tsx
import React from 'react';

type Invoice = {
  id: string;
  amount: number;
  issued_at: string;
  status: string;
};

export default function InvoiceList({ invoices }: { invoices: Invoice[] }) {
  if (!invoices.length) return <p>Aucune facture disponible.</p>;
  return (
    <ul className="space-y-2">
      {invoices.map(inv => (
        <li key={inv.id} className="p-3 rounded bg-secondary/10">
          <div className="font-semibold">Facture #{inv.id}</div>
          <div>Montant : {inv.amount} FCFA</div>
          <div>Émise le : {new Date(inv.issued_at).toLocaleDateString()}</div>
          <div>Status : {inv.status}</div>
        </li>
      ))}
    </ul>
  );
}
