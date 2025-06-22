import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-gray-50">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <Header />
          <SidebarInset className="flex-1">
            <Outlet />
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  );
}
