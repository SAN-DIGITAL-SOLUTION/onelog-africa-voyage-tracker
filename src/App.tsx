import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Toaster } from "@/components/ui/toaster";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Missions from "@/pages/Missions";
import MissionsChauffeur from "@/pages/MissionsChauffeur";
import Notifications from "@/pages/Notifications";
import Invoices from "@/pages/Invoices";
import TrackingMap from "@/pages/TrackingMap";
import QADashboard from "@/pages/QADashboard";
import ClientDashboard from "@/pages/ClientDashboard";
import ChauffeurDashboard from "@/pages/ChauffeurDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import MissionTracking from "@/pages/MissionTracking";
import Landing from "@/pages/Landing";
import NoRole from "@/pages/NoRole";
import NotFound from "@/pages/NotFound";
import NotificationToast from "@/components/NotificationToast";
import Onboarding from "@/pages/Onboarding";
import RoleRequests from "@/pages/Admin/RoleRequests";
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

import MainLayout from "@/components/MainLayout";

function RequireRole({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return null;
  if (user && !user.role && location.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Route publique landing page */}
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/admin/role-requests" element={<RequireRole><RoleRequests /></RequireRole>} />
            <Route path="/no-role" element={<NoRole />} />
            <Route path="/404" element={<NotFound />} />
            {/* Routes authentifiées sous MainLayout (sidebar + header) */}
            <Route element={<MainLayout />}>
              <Route path="/dashboard" element={
                <RequireRole>
                  <Dashboard />
                </RequireRole>
              } />
              <Route path="/qa-dashboard" element={
                <RequireRole>
                  <QADashboard />
                </RequireRole>
              } />
              <Route path="/client-dashboard" element={
                <RequireRole>
                  <ClientDashboard />
                </RequireRole>
              } />
              <Route path="/chauffeur-dashboard" element={
                <RequireRole>
                  <ChauffeurDashboard />
                </RequireRole>
              } />
              <Route path="/admin-dashboard" element={
                <RequireRole>
                  <AdminDashboard />
                </RequireRole>
              } />
              <Route path="/missions/*" element={
                <RequireRole>
                  <Missions />
                </RequireRole>
              } />
              <Route path="/missions-chauffeur" element={
                <RequireRole>
                  <MissionsChauffeur />
                </RequireRole>
              } />
              <Route path="/notifications" element={
                <RequireRole>
                  <Notifications />
                </RequireRole>
              } />
              <Route path="/invoices" element={
                <RequireRole>
                  <Invoices />
                </RequireRole>
              } />
              <Route path="/tracking" element={
                <RequireRole>
                  <TrackingMap />
                </RequireRole>
              } />
              <Route path="/missions/:id/tracking" element={
                <RequireRole>
                  <MissionTracking />
                </RequireRole>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
          <NotificationToast />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
