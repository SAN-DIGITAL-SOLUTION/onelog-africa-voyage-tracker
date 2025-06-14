
import { NavLink } from "react-router-dom";
import { BadgeCheck } from "lucide-react";

const headerLinks = [
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/missions", label: "Missions" },
  { to: "/tracking", label: "Carte de suivi" },
  { to: "/invoices", label: "Factures" },
  { to: "/notifications", label: "Notifications" },
];

export default function Header() {
  return (
    <header className="flex items-center justify-between py-4 px-0 border-b bg-white z-10">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-onelog-nuit tracking-tight flex items-center gap-2">
          <BadgeCheck size={28} className="text-onelog-bleu" />
          OneLog Africa
        </span>
      </div>
      <nav className="flex gap-6 font-semibold text-base">
        {headerLinks.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `relative py-1 px-2 rounded transition-colors duration-200 ${
                isActive
                  ? "bg-onelog-bleu text-white shadow"
                  : "hover:bg-onelog-bleu/10 text-onelog-nuit"
              }`
            }
            end
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
