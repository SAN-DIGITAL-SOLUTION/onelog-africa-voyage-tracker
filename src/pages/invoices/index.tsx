import InvoiceViewer from '../../components/InvoiceViewer';

export default function InvoicesPage() {
  return (
    <main className="container mx-auto pt-8 px-2 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Factures</h1>
      <InvoiceViewer />
    </main>
  );
}
