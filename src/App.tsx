import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { useRole, RoleProvider } from "@/hooks/useRole";
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
import WaitingApproval from "@/pages/WaitingApproval";
import RoleRequests from "@/pages/Admin/RoleRequests";
import AdminSettings from "@/pages/AdminSettings";
import AdminAnalytics from "@/pages/AdminAnalytics";
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
import TimelinePage from "@/pages/timeline";
import TimelinePageOptimized from "@/pages/timeline/TimelinePageOptimized";
import TrackingDemo from "@/pages/TrackingDemo";

function RequireRole({ children }: { children: JSX.Element }) {
  const { user, loading: authLoading } = useAuth();
  const { role, loadingRole } = useRole();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Afficher un indicateur de chargement pendant la vérification de l'authentification et du rôle
  if (authLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la page de connexion
  if (!user) {
    // Ne pas rediriger si on est déjà sur la page d'authentification
    if (currentPath !== '/auth') {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return children;
  }
  
  // Si l'utilisateur est sur la page d'onboarding, on le laisse y accéder
  if (currentPath === "/onboarding") {
    return children;
  }
  
  // Si l'utilisateur n'a pas de rôle, rediriger vers l'onboarding
  if (!role) {
    // Ne pas rediriger si on est déjà sur la page d'onboarding
    if (currentPath !== '/onboarding') {
      return <Navigate to="/onboarding" replace />;
    }
    return children;
  }
  
  // Si l'utilisateur a un rôle valide, afficher le contenu protégé
  return children;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RoleProvider>
          <Router>
            <Routes>
              {/* Route publique landing page */}
              <Route path="/" element={<Index />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/waiting-approval" element={<WaitingApproval />} />
              <Route path="/admin/role-requests" element={<RequireRole><RoleRequests /></RequireRole>} />
              <Route path="/admin/settings" element={<RequireRole><AdminSettings /></RequireRole>} />
              <Route path="/admin/analytics" element={<RequireRole><AdminAnalytics /></RequireRole>} />
              <Route path="/no-role" element={<NoRole />} />
              <Route path="/404" element={<NotFound />} />
            {/* Routes authentifiées sous MainLayout (sidebar + header) */}
            <Route element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
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
              <Route path="/timeline" element={
                <RequireRole>
                  <TimelinePage />
                </RequireRole>
              } />
              <Route path="/timeline-optimized" element={
                <RequireRole>
                  <TimelinePageOptimized />
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
              <Route path="/tracking-demo" element={
                <RequireRole>
                  <TrackingDemo />
                </RequireRole>
              } />
            </Route>
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
          <Toaster />
          <NotificationToast />
        </Router>
        </RoleProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
