import { Navigate, useLocation } from 'react-router-dom';
import { useRole } from '@/hooks/useRole';
import { useEffect, useState, useMemo } from 'react';

// Composant pour afficher un indicateur de chargement
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}

export default function Index() {
  const { role, loadingRole } = useRole();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const currentPath = location.pathname;

  // Mettre à jour l'état de chargement
  useEffect(() => {
    if (!loadingRole) {
      setIsLoading(false);
    }
  }, [loadingRole]);

  // Mémoriser la cible de redirection pour éviter des recalculs inutiles
  const targetPath = useMemo(() => {
    if (!role) return '/onboarding';
    
    switch (role) {
      case 'admin':
        return '/admin-dashboard';
      case 'chauffeur':
        return '/chauffeur-dashboard';
      case 'exploiteur':
        return '/qa-dashboard';
      case 'client':
        return '/client-dashboard';
      default:
        console.warn(`Rôle non reconnu: ${role}`);
        return '/onboarding';
    }
  }, [role]);

  // Afficher un indicateur de chargement si nécessaire
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Éviter les redirections inutiles si on est déjà sur la bonne page
  if (currentPath === targetPath) {
    return null; // ou un composant vide
  }

  // Si l'utilisateur n'a pas de rôle, rediriger vers la page d'onboarding
  if (!role) {
    return <Navigate to={targetPath} replace />;
  }

  // Rediriger vers la page appropriée en fonction du rôle
  return <Navigate to={targetPath} replace />;
}
