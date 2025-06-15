
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

const routes = [
  {
    label: "Tableau de bord",
    to: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Missions",
    to: "/missions",
    icon: Truck,
  },
  {
    label: "Carte de suivi",
    to: "/tracking",
    icon: Map,
  },
  {
    label: "Factures",
    to: "/invoices",
    icon: FileText,
  },
  {
    label: "Notifications",
    to: "/notifications",
    icon: Bell,
  },
];

export default function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();

  return (
    <Sidebar className="min-h-screen border-r bg-primary dark:bg-primary pt-4 w-56 data-[state=collapsed]:w-14 transition-all duration-200">
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
              Navigation
            </div>
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((r) => (
                <SidebarMenuItem key={r.to}>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith(r.to)}>
                    <NavLink
                      to={r.to}
                      end={r.to === "/dashboard"}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded hover:bg-accent/20 transition-colors group
                        ${
                          isActive
                            ? "bg-white text-accent font-extrabold shadow-sm"
                            : "text-white"
                        }`
                      }
                    >
                      <r.icon
                        className={`h-5 w-5 shrink-0 transition-colors ${
                          location.pathname.startsWith(r.to)
                            ? "text-accent"
                            : "text-white"
                        }`}
                      />
                      {state !== "collapsed" && (
                        <span
                          className={`transition-colors ${
                            location.pathname.startsWith(r.to)
                              ? "text-accent"
                              : ""
                          }`}
                        >
                          {r.label}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

