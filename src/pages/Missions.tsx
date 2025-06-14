
import { useNavigate } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";

const missions = [
  {
    id: 1,
    ref: "MISS-230018",
    client: "MabekoTrans",
    chauffeur: "A. Touré",
    date: "12/06/2025",
    status: "Planifiée",
  },
  {
    id: 2,
    ref: "MISS-230019",
    client: "QuickCargo",
    chauffeur: "B. Diop",
    date: "14/06/2025",
    status: "En cours",
  },
];

export default function Missions() {
  const navigate = useNavigate();

  return (
    <main className="container mx-auto pt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Missions</h1>
        <button
          className="flex items-center gap-2 bg-onelog-bleu text-white font-bold px-4 py-2 rounded shadow hover:scale-105 transition-all"
          onClick={() => navigate("/missions/new")}
        >
          <Plus size={20} /> Nouvelle mission
        </button>
      </div>
      <table className="w-full border rounded-lg bg-white shadow-sm">
        <thead>
          <tr className="bg-onelog-nuit/90 text-white">
            <th className="py-2 px-3 text-left">Référence</th>
            <th className="py-2 px-3 text-left">Client</th>
            <th className="py-2 px-3 text-left">Chauffeur</th>
            <th className="py-2 px-3 text-left">Date</th>
            <th className="py-2 px-3 text-left">Statut</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {missions.map((m) => (
            <tr
              className="border-b last:border-none hover:bg-onelog-bleu/5 transition"
              key={m.id}
            >
              <td className="py-2 px-3">{m.ref}</td>
              <td className="py-2 px-3">{m.client}</td>
              <td className="py-2 px-3">{m.chauffeur}</td>
              <td className="py-2 px-3">{m.date}</td>
              <td className="py-2 px-3">
                <span
                  className={
                    "px-2 py-1 rounded text-sm font-semibold " +
                    (m.status === "En cours"
                      ? "bg-onelog-citron/60 text-onelog-nuit"
                      : "bg-onelog-bleu/20 text-onelog-bleu")
                  }
                >
                  {m.status}
                </span>
              </td>
              <td>
                <button
                  onClick={() => navigate(`/missions/${m.id}`)}
                  className="p-1 rounded hover:bg-onelog-bleu/10"
                  title="Voir le détail"
                >
                  <ChevronRight size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
}
