import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

const HomeRedirect = () => {
  const { user, loading: authLoading } = useAuth();
  const { role, loadingRole } = useRole();

  if (authLoading || loadingRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  switch (role) {
    case 'client':
      return <Navigate to="/client-dashboard" replace />;
    case 'exploitant':
      return <Navigate to="/exploiteur-dashboard" replace />;
    case 'chauffeur':
      return <Navigate to="/chauffeur-dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin-dashboard" replace />;
    default:
      return <Navigate to="/onboarding" replace />;
  }
};

export default HomeRedirect;
