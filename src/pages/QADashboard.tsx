import React from 'react';

export default function QADashboard() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-primary">Dashboard QA</h1>
        <a href="/dashboard" className="text-sm text-accent underline hover:text-accent-dark">← Retour à la navigation principale</a>
      </header>
      <section>
        <iframe
          src="/docs/TEST_AUDIT.html"
          title="Rapport de couverture QA"
          className="w-full min-h-[600px] bg-white border rounded shadow"
        />
      </section>
    </main>
  );
}
