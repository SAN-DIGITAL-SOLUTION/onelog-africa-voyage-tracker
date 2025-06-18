
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "./AppSidebar";
import Header from "./Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <Header />
          <div className="flex-1">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
