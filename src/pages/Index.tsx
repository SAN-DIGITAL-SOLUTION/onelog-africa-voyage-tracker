import { Navigate } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useAuth } from '@/hooks/useAuth';

export default function Index() {
  const { role, loadingRole } = useRole();
  const { user, loading: authLoading } = useAuth();

  // Afficher un indicateur de chargement pendant la vérification
  if (authLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas connecté, rediriger vers l'authentification
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Si l'utilisateur n'a pas de rôle, rediriger vers l'onboarding
  if (!role) {
    return <Navigate to="/onboarding" replace />;
  }

  // Rediriger vers le dashboard approprié selon le rôle
  const dashboardMap = {
    'admin': '/admin-dashboard',
    'super_admin': '/admin-dashboard', 
    'chauffeur': '/chauffeur-dashboard',
    'exploiteur': '/qa-dashboard',
    'client': '/client-dashboard'
  };

  const targetPath = dashboardMap[role] || '/dashboard';
  return <Navigate to={targetPath} replace />;
}
