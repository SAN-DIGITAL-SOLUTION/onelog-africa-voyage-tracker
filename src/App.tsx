
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { RoleProvider } from "@/hooks/useRole";
import { Toaster } from "@/components/ui/toaster";
import AppLayout from "@/components/AppLayout";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import Notifications from "@/pages/Notifications";
import Invoices from "@/pages/Invoices";
import TrackingMap from "@/pages/TrackingMap";
import Landing from "@/pages/Landing";
import NoRole from "@/pages/NoRole";
import NotFound from "@/pages/NotFound";
import NotificationToast from "@/components/NotificationToast";
import "./App.css";

// React Query setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RoleProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/landing" element={<Landing />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/no-role" element={<NoRole />} />
                <Route path="/404" element={<NotFound />} />
                {/* Pages authentifiées avec layout */}
                <Route path="/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
                <Route path="/missions/*" element={<AppLayout><Missions /></AppLayout>} />
                <Route path="/notifications" element={<AppLayout><Notifications /></AppLayout>} />
                <Route path="/invoices" element={<AppLayout><Invoices /></AppLayout>} />
                <Route path="/tracking" element={<AppLayout><TrackingMap /></AppLayout>} />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
              <Toaster />
              <NotificationToast />
            </div>
          </Router>
        </AuthProvider>
      </RoleProvider>
    </QueryClientProvider>
  );
}

export default App;
