
import { FileText, Truck, Bell, LayoutDashboard } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

const stats = [
  {
    title: "Missions actives",
    value: 12,
    icon: Truck,
    color: "bg-onelog-bleu/10 text-onelog-bleu",
    iconBg: "bg-onelog-bleu/10",
  },
  {
    title: "Factures émises",
    value: 23,
    icon: FileText,
    color: "bg-onelog-citron/10 text-onelog-citron",
    iconBg: "bg-onelog-citron/20",
  },
  {
    title: "Notifications envoyées",
    value: 37,
    icon: Bell,
    color: "bg-onelog-nuit/10 text-onelog-nuit",
    iconBg: "bg-onelog-nuit/10",
  },
];

export default function Dashboard() {
  return (
    <RequireAuth>
      <main className="container mx-auto pt-10 max-w-4xl animate-fade-in">
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center justify-center rounded-full bg-onelog-bleu/10 text-onelog-bleu p-2">
            <LayoutDashboard size={28} aria-hidden />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight">Tableau de bord</h1>
        </div>
        <p className="text-lg text-gray-500 mb-8 max-w-2xl">
          Gérez vos missions, suivez vos chauffeurs en temps réel et facilitez votre facturation sur votre espace OneLog Africa.
        </p>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`group rounded-xl p-5 flex items-center gap-4 shadow-lg border border-gray-100 hover:scale-[1.03] hover:border-onelog-bleu/40 transition-transform duration-200 bg-white cursor-pointer ${s.color}`}
            >
              <div className={`rounded-full ${s.iconBg} p-3 shadow-sm group-hover:scale-105 transition-transform`}>
                <s.icon size={30} className="shrink-0" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold leading-tight mb-1">{s.value}</span>
                <span className="block text-base text-gray-600 font-medium">{s.title}</span>
              </div>
            </div>
          ))}
        </section>
        <div className="bg-gradient-to-br from-onelog-nuit/90 to-onelog-bleu/90 rounded-lg p-6 text-white font-semibold shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <span className="text-base md:text-lg">Vous débutez ? Consultez la rubrique missions pour créer votre première opération.</span>
          <a
            href="/missions"
            className="inline-flex items-center gap-1 bg-onelog-citron text-onelog-nuit font-bold px-5 py-2 rounded-md shadow hover:scale-105 transition-all hover:bg-onelog-citron/90 focus:ring-2 focus:ring-onelog-bleu focus:outline-none"
          >
            <Truck className="mr-1" size={18} /> Nouvelle mission
          </a>
        </div>
      </main>
    </RequireAuth>
  );
}

