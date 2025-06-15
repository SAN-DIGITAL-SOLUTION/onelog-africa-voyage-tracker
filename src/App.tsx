import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import AppSidebar from "./components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Missions from "./pages/Missions";
import TrackingMap from "./pages/TrackingMap";
import Invoices from "./pages/Invoices";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProvider } from "@/hooks/useRole";
import NoRole from "@/pages/NoRole";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import Landing from "./pages/Landing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RoleProvider>
          <AuthProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full bg-gray-50 dark:bg-onelog-nuit">
                <AppSidebar />
                <SidebarInset>
                  <Header />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/missions/*" element={<Missions />} />
                    <Route path="/tracking" element={<TrackingMap />} />
                    <Route path="/invoices" element={<Invoices />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/no-role" element={<NoRole />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </AuthProvider>
        </RoleProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
