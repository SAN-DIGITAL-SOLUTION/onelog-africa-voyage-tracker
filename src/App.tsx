import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
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
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/missions/*" element={<Missions />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/tracking" element={<TrackingMap />} />
              <Route path="/no-role" element={<NoRole />} />
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
            <Toaster />
            <NotificationToast />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
