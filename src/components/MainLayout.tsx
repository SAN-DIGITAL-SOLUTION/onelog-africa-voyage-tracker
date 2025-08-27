import AppSidebar from "./AppSidebar";
import Header from "./Header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";

import { SidebarProvider } from "@/components/ui/sidebar";

export default function MainLayout() {
  return (
    <SidebarProvider>
      {/* Container avec marges de 1cm sur desktop (≈ 0.4rem = 1cm) */}
      <div className="min-h-screen bg-gray-50 p-1 sm:p-2 lg:p-4">
        <div className="grid grid-cols-12 min-h-[calc(100vh-0.5rem)] sm:min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-2rem)] bg-white rounded-lg shadow-sm overflow-hidden">
          <AppSidebar />
          <div className="col-span-11 col-start-2 flex flex-col min-h-full w-full max-w-full sm:col-span-10 sm:col-start-3 lg:col-span-10 lg:col-start-3">
            <Header />
            <SidebarInset className="flex-1 overflow-auto">
              <div className="h-full">
                <Outlet />
              </div>
            </SidebarInset>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
