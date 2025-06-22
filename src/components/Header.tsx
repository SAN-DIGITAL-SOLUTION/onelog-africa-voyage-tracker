
import { NavLink, useNavigate } from "react-router-dom";
import { BadgeCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "./ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";

// Toggle light/dark (Tailwind config)
function ModeToggle() {
  const [theme, setTheme] = useState(
    () =>
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
  );

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  return (
    <button
      className="ml-2 flex gap-2 items-center rounded p-2 bg-gray-100 dark:bg-onelog-nuit hover:bg-gray-200 dark:hover:bg-onelog-bleu/20 transition"
      aria-label="Basculer mode sombre"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
    >
      <span className="sr-only">Basculer mode sombre</span>
      {theme === "dark" ? (
        // soleil
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M10 2a1 1 0 01.993.883L11 3v1a1 1 0 01-1.993.117L9 4V3a1 1 0 011-1zm5.657 3.757a1 1 0 01.117 1.41l-.083.094-.714.715a1 1 0 01-1.497-1.32l.083-.094.715-.714a1 1 0 011.379 0zM17 9a1 1 0 01.117 1.993L17 11h-1a1 1 0 01-.117-1.993L16 9zm-2.686 6.243a1 1 0 01-1.32 1.497l-.094-.083-.714-.715a1 1 0 011.32-1.497l.094.083.714.715zM10 16a1 1 0 01.993.883L11 17v1a1 1 0 01-1.993.117L9 18v-1a1 1 0 011-1zm-6.364-1.243a1 1 0 01-.117-1.41l.083-.094.715-.714a1 1 0 111.32 1.497l-.083.093-.715.715a1 1 0 01-1.203-.087zm-1.243-4.514A1 1 0 013 9h1a1 1 0 01.117 1.993L4 11H3a1 1 0 01-.607-1.85zM6.343 4.757a1 1 0 010 1.414l-.715.714a1 1 0 01-1.497-1.32l.083-.095a1 1 0 011.379 0zM10 6a4 4 0 100 8 4 4 0 000-8z"
          />
        </svg>
      ) : (
        // lune
        <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
          <path
            d="M17.293 13.293A8 8 0 116.707 2.707a8.003 8.003 0 0010.586 10.586z"
          />
        </svg>
      )}
    </button>
  );
}

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/Avatar";
import { User, UserCog, Repeat, LogOut } from "lucide-react";

export default function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const handleProfile = () => navigate("/profile");
  const handleOnboarding = () => navigate("/onboarding");
  const handleSwitchRole = () => navigate("/switch-role");

  return (
    <header className="flex items-center justify-between py-3 px-4 border-b bg-white dark:bg-onelog-nuit z-10" aria-label="Header principal">
      <div className="flex items-center gap-2">
        {/* SidebarTrigger toujours visible sur mobile/desktop */}
        <SidebarTrigger className="md:hidden" />
        <span className="text-2xl font-bold text-onelog-nuit dark:text-white tracking-tight flex items-center gap-2">
          <BadgeCheck size={28} className="text-onelog-bleu" />
          OneLog Africa
        </span>
      </div>
      <nav className="flex gap-4 font-semibold text-base items-center">
        {/* Bouton Accueil OneLog Africa */}
        <Button asChild variant="outline" size="sm">
          <NavLink to="/" className="flex items-center">
            Accueil OneLog Africa
          </NavLink>
        </Button>
        <ModeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="ml-4 flex items-center focus:outline-none focus:ring-2 focus:ring-accent rounded-full"
                aria-label="Ouvrir le menu utilisateur"
              >
                <Avatar>
                  <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} />
                  <AvatarFallback>{user.email?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col gap-1">
                <span className="font-bold truncate">{user.email}</span>
                <span className="text-xs text-muted-foreground">{user.user_metadata?.role || "Utilisateur"}</span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleProfile} className="flex items-center gap-2 cursor-pointer">
                <User size={16} /> Profil
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleOnboarding} className="flex items-center gap-2 cursor-pointer">
                <Repeat size={16} /> Revoir l’onboarding
              </DropdownMenuItem>
              {user.user_metadata?.roles?.length > 1 && (
                <DropdownMenuItem onSelect={handleSwitchRole} className="flex items-center gap-2 cursor-pointer">
                  <UserCog size={16} /> Changer de rôle
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleLogout} className="flex items-center gap-2 cursor-pointer text-red-600">
                <LogOut size={16} /> Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </nav>
    </header>
  );
}
