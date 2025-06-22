
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Map,
  FileText,
  Bell,
  Truck,
} from "lucide-react";

import { supabase } from "@/lib/supabaseClient";

import { useEffect, useState } from "react";

// Hook pour récupérer le rôle utilisateur via Supabase v2
function useUserRole() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchRole() {
      const { data: { user } } = await supabase.auth.getUser();
      // Ici, on suppose que le rôle est dans user.user_metadata.role (adapter selon ta structure)
      if (user && user.user_metadata && user.user_metadata.role) {
        if (isMounted) setRole(user.user_metadata.role);
      } else {
        if (isMounted) setRole(null);
      }
    }
    fetchRole();
    // Optionnel : écoute les changements d'auth
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      fetchRole();
    });
    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);
  return role;
}

// Tableau de routes de base, sans "Mes missions"
import { Users, UserCheck, UserCog, ShieldCheck, Activity } from "lucide-react";
import { useSidebarBadges } from "@/hooks/useSidebarBadges";

const QA_DASHBOARD_RELEASE_DATE = new Date("2025-06-22T00:00:00Z");
const NOW = new Date();
const QA_IS_NEW = (NOW.getTime() - QA_DASHBOARD_RELEASE_DATE.getTime()) < 7 * 24 * 60 * 60 * 1000;

const dashboards = [
  {
    label: "Dashboard QA",
    to: "/qa-dashboard",
    icon: Activity,
    badge: QA_IS_NEW ? { label: "Nouveau", color: "bg-green-600" } : undefined,
  },
  {
    label: "Dashboard Client",
    to: "/client-dashboard",
    icon: UserCheck,
  },
  {
    label: "Dashboard Chauffeur",
    to: "/chauffeur-dashboard",
    icon: Users,
  },
  {
    label: "Dashboard Admin",
    to: "/admin-dashboard",
    icon: UserCog,
  },
];
const operations = [
  {
    label: "Missions",
    to: "/missions",
    icon: Truck,
    badgeKey: "missionCount",
  },
  {
    label: "Facturation",
    to: "/invoices",
    icon: FileText,
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
    badgeKey: "notifCount",
  },
  {
    label: "Tracking live",
    to: "/missions/1/tracking",
    icon: Map,
  },
  {
    label: "Demandes en attente",
    to: "/admin/role-requests",
    icon: ShieldCheck,
    badgeKey: "pendingCount",
    adminOnly: true,
  },
];

export default function AppSidebar() {
  const userRole = useUserRole();
  const { state } = useSidebar();
  const location = useLocation();
  const { missionCount, notifCount, pendingCount, role } = useSidebarBadges();

  // Affichage conditionnel : attendre la résolution du hook avant d'afficher la navigation
  if (userRole === undefined) {
    return null; // ou un loader si besoin
  }

  function renderBadge(item: any) {
    const badgeBase =
      "ml-2 text-xs font-bold h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full bg-[#E65100] text-white transition-transform duration-100 scale-100 hover:scale-110 focus:scale-110 outline-none shadow-sm";
    if (item.badgeKey === "missionCount" && missionCount && missionCount > 0) {
      return (
        <span
          className={badgeBase}
          aria-label={`${missionCount} missions en cours`}
          tabIndex={-1}
        >
          {missionCount}
        </span>
      );
    }
    if (item.badgeKey === "notifCount" && notifCount && notifCount > 0) {
      return (
        <span
          className={badgeBase}
          aria-label={`${notifCount} notifications non lues`}
          tabIndex={-1}
        >
          {notifCount}
        </span>
      );
    }
    if (item.badgeKey === "pendingCount" && pendingCount && pendingCount > 0) {
      return (
        <span
          className={badgeBase}
          aria-label={`${pendingCount} demandes en attente`}
          tabIndex={-1}
        >
          {pendingCount}
        </span>
      );
    }
    if (item.badge) {
      // Badge "Nouveau" ou autre : couleur personnalisée
      return (
        <span
          className={`ml-2 text-xs font-bold h-5 min-w-5 px-1.5 flex items-center justify-center rounded-full ${item.badge.color} text-white transition-transform duration-100 scale-100 hover:scale-110 focus:scale-110 outline-none shadow-sm`}
          aria-label={item.badge.label}
          tabIndex={-1}
        >
          {item.badge.label}
        </span>
      );
    }
    return null;
  }

  return (
    <Sidebar className="min-h-screen border-r bg-primary dark:bg-primary pt-4 w-56 data-[state=collapsed]:w-14 transition-all duration-200" aria-label="Sidebar principale">
      <div className="flex items-center gap-2 px-4 mb-8">
        <img src="/favicon.ico" alt="logo" className="h-7 w-7" />
        {state !== "collapsed" && (
          <span className="font-bold text-lg tracking-tight text-white">
            OneLog Africa
          </span>
        )}
        <SidebarTrigger className="ml-auto" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="text-xs mb-2 font-semibold text-secondary pl-4">
              Dashboards
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {dashboards.map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.to}
                        aria-label={item.label}
                        className={({ isActive: navActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded transition-colors group focus:outline focus:outline-2 focus:outline-accent
                          ${isActive ? "bg-white shadow-sm" : ""}`
                        }
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-accent" : "text-white group-hover:text-accent"}`} />
                        {state !== "collapsed" && (
                          <span className={`font-bold transition-colors ${isActive ? "text-white" : "text-white group-hover:text-accent"}`}>{item.label}</span>
                        )}
                        {renderBadge(item)}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="text-xs mb-2 font-semibold text-secondary pl-4">
              Opérations
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {operations.filter(item => !item.adminOnly || role === "admin").map((item) => {
                const isActive = location.pathname.startsWith(item.to);
                return (
                  <SidebarMenuItem key={item.to}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <NavLink
                        to={item.to}
                        aria-label={item.label}
                        className={({ isActive: navActive }) =>
                          `flex items-center gap-3 px-3 py-2 rounded transition-colors group focus:outline focus:outline-2 focus:outline-accent
                          ${isActive ? "bg-white shadow-sm" : ""}`
                        }
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-accent" : "text-white group-hover:text-accent"}`} />
                        {state !== "collapsed" && (
                          <span className={`font-bold transition-colors ${isActive ? "text-white" : "text-white group-hover:text-accent"}`}>{item.label}</span>
                        )}
                        {renderBadge(item)}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
