
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
  Users,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

import { useEffect, useState } from "react";
import { useRole } from "@/hooks/useRole";

// Hook pour récupérer le rôle utilisateur via le contexte
function useUserRole() {
  const { role } = useRole();
  return role;
}

// Tableau de routes de base, sans "Mes missions"
import { UserCheck, UserCog, ShieldCheck, Activity } from "lucide-react";
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
    to: "/tracking",
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
    <Sidebar className="border-r bg-white shadow-sm col-span-1 sm:col-span-2 lg:col-span-2">
      <div className="flex items-center justify-between p-2 sm:p-4 border-b">
        <div className="flex items-center gap-1 sm:gap-2">
          <img
            src="/Logo de OneLog Africa 3.png"
            alt="OneLog Africa"
            className="h-6 w-6 sm:h-8 sm:w-8"
          />
          <span className="font-bold text-sm sm:text-lg text-gray-900 hidden sm:block">OneLog</span>
        </div>
        <SidebarTrigger className="md:hidden" />
      </div>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel asChild>
            <div className="text-xs mb-2 font-semibold text-gray-600 pl-4">
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
                          `flex items-center gap-3 px-3 py-2 rounded transition-colors group focus:outline focus:outline-2 focus:outline-blue-500
                          ${isActive ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"}`
                        }
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"}`} />
                        {state !== "collapsed" && (
                          <span className={`font-medium transition-colors ${isActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"}`}>{item.label}</span>
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
            <div className="text-xs mb-2 font-semibold text-gray-600 pl-4">
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
                          `flex items-center gap-3 px-3 py-2 rounded transition-colors group focus:outline focus:outline-2 focus:outline-blue-500
                          ${isActive ? "bg-blue-50 shadow-sm" : "hover:bg-gray-50"}`
                        }
                      >
                        <item.icon className={`h-5 w-5 shrink-0 transition-colors ${isActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"}`} />
                        {state !== "collapsed" && (
                          <span className={`font-medium transition-colors ${isActive ? "text-blue-600" : "text-gray-700 group-hover:text-blue-600"}`}>{item.label}</span>
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
