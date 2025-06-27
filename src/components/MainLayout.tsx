import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      <div className="grid grid-cols-12 min-h-screen bg-gray-50">
        <AppSidebar />
        <div className="col-span-10 col-start-2 flex flex-col min-h-screen w-full max-w-full md:col-span-10 md:col-start-2 lg:col-span-10 lg:col-start-2">
  <Header />
  <SidebarInset className="flex-1">
    <Outlet />
  </SidebarInset>
</div>
      </div>
    </SidebarProvider>
  );
}
