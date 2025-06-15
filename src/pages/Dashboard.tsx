
import { FileText, Truck, Bell, LayoutDashboard } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";

const stats = [
  {
    title: "Missions actives",
    value: 12,
    icon: Truck,
    color: "bg-fresh/10 text-fresh",
    iconBg: "bg-fresh/20",
  },
  {
    title: "Factures émises",
    value: 23,
    icon: FileText,
    color: "bg-secondary/10 text-secondary",
    iconBg: "bg-secondary/20",
  },
  {
    title: "Notifications envoyées",
    value: 37,
    icon: Bell,
    color: "bg-primary/10 text-primary",
    iconBg: "bg-primary/10",
  },
];

export default function Dashboard() {
  return (
    <RequireAuth>
      <main className="container mx-auto pt-12 max-w-4xl animate-fade-in">
        <div className="flex items-center gap-2 mb-5">
          <span className="inline-flex items-center justify-center rounded-full bg-secondary/20 text-secondary p-2">
            <LayoutDashboard size={28} aria-hidden className="text-secondary" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight font-montserrat text-primary">Tableau de bord</h1>
        </div>
        <p className="text-lg text-primary/80 mb-8 max-w-2xl">
          Gérez vos missions, suivez vos chauffeurs en temps réel et facilitez votre facturation sur votre espace OneLog Africa.
        </p>
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className={`group rounded-xl p-5 flex items-center gap-4 shadow-lg border border-gray-100 hover:scale-[1.03] hover:border-secondary/40 transition-transform duration-200 bg-white cursor-pointer ${s.color}`}
            >
              <div className={`rounded-full ${s.iconBg} p-3 shadow-sm group-hover:scale-105 transition-transform`}>
                <s.icon size={30} className="shrink-0" />
              </div>
              <div>
                <span className="block text-3xl font-extrabold leading-tight mb-1 font-montserrat">{s.value}</span>
                <span className="block text-base text-primary font-medium">{s.title}</span>
              </div>
            </div>
          ))}
        </section>
        <div className="bg-gradient-to-br from-primary/90 to-fresh/90 rounded-lg p-6 text-dm-text font-semibold shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3">
          <span className="text-base md:text-lg">Vous débutez ? Consultez la rubrique missions pour créer votre première opération.</span>
          <a
            href="/missions"
            className="inline-flex items-center gap-1 bg-accent text-white font-bold font-montserrat px-5 py-2 rounded-full shadow hover:scale-105 transition-all hover:bg-accent-hover focus:ring-4 focus:ring-secondary focus:outline-none"
          >
            <Truck className="mr-1" size={18} /> Nouvelle mission
          </a>
        </div>
      </main>
    </RequireAuth>
  );
}
