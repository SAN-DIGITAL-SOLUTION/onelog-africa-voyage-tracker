
import { NavLink, useNavigate } from "react-router-dom";
import { BadgeCheck, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";

const headerLinks = [
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/missions", label: "Missions" },
  { to: "/tracking", label: "Carte de suivi" },
  { to: "/invoices", label: "Factures" },
  { to: "/notifications", label: "Notifications" },
];

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <header className="flex items-center justify-between py-4 px-0 border-b bg-white z-10">
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-onelog-nuit tracking-tight flex items-center gap-2">
          <BadgeCheck size={28} className="text-onelog-bleu" />
          OneLog Africa
        </span>
      </div>
      <nav className="flex gap-6 font-semibold text-base items-center">
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
        {user && (
          <Button
            variant="outline"
            size="sm"
            className="ml-4 flex gap-2 items-center"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Déconnexion
          </Button>
        )}
      </nav>
    </header>
  );
}
