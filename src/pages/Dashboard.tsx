
import { FileText, Truck, Bell } from "lucide-react";

const stats = [
  {
    title: "Missions actives",
    value: 12,
    icon: Truck,
    color: "bg-onelog-bleu/10 text-onelog-bleu",
  },
  {
    title: "Factures émises",
    value: 23,
    icon: FileText,
    color: "bg-onelog-citron/10 text-onelog-citron",
  },
  {
    title: "Notifications envoyées",
    value: 37,
    icon: Bell,
    color: "bg-onelog-nuit/10 text-onelog-nuit",
  },
];

export default function Dashboard() {
  return (
    <main className="container mx-auto pt-10">
      <h1 className="text-3xl font-bold mb-2">Bienvenue sur OneLog Africa</h1>
      <p className="text-lg text-gray-500 mb-5">
        Gérez vos missions, suivez vos chauffeurs en temps réel et facilitez votre facturation.
      </p>
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
        {stats.map((s, idx) => (
          <div
            key={idx}
            className={`rounded-lg p-6 flex items-center gap-4 shadow-sm ${s.color}`}
          >
            <s.icon size={34} className="shrink-0" />
            <div>
              <span className="block text-2xl font-extrabold">{s.value}</span>
              <span className="block text-base">{s.title}</span>
            </div>
          </div>
        ))}
      </section>
      <div className="bg-onelog-nuit/90 rounded-lg p-6 text-white font-semibold shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <span>Vous débutez ? Consultez la rubrique missions pour créer votre première opération.</span>
          <a
            href="/missions"
            className="inline-flex items-center gap-1 bg-onelog-citron text-onelog-nuit font-bold px-4 py-2 rounded-md shadow hover:scale-105 transition-all"
          >
            Nouvelle mission
          </a>
        </div>
      </div>
    </main>
  );
}
