import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { useUser } from '@supabase/auth-helpers-react';
import { UserRole } from '@/integrations/supabase/types';
import { hasAnyRole } from '@/integrations/supabase/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  /**
   * Rôles autorisés à accéder à la route
   * Si non spécifié, seul un utilisateur connecté est requis
   */
  allowedRoles?: UserRole[];
  /**
   * Chemin de redirection si l'utilisateur n'est pas autorisé
   * @default '/login' pour les utilisateurs non connectés, '/unauthorized' pour les non autorisés
   */
  redirectTo?: string;
  /**
   * Afficher un indicateur de chargement pendant la vérification
   */
  loadingComponent?: ReactNode;
  /**
   * Composant à afficher si l'utilisateur n'est pas autorisé
   */
  unauthorizedComponent?: ReactNode;
}

/**
 * Composant pour protéger les routes en fonction de l'authentification et des rôles
 */
export default function ProtectedRoute({
  children,
  allowedRoles,
  redirectTo,
  loadingComponent = null,
  unauthorizedComponent = null,
}: ProtectedRouteProps) {
  const router = useRouter();
  const user = useUser();
  const isLoading = !user && typeof window !== 'undefined';

  useEffect(() => {
    const checkAuth = async () => {
      if (!user) {
        // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
        router.push(redirectTo || '/login');
        return;
      }

      // Si des rôles sont spécifiés, vérifier que l'utilisateur a l'un des rôles requis
      if (allowedRoles && allowedRoles.length > 0) {
        const hasAccess = await hasAnyRole(allowedRoles);
        if (!hasAccess) {
          if (unauthorizedComponent) return;
          router.push(redirectTo || '/unauthorized');
        }
      }
    };

    checkAuth();
  }, [user, allowedRoles, router, redirectTo, unauthorizedComponent]);

  // Afficher un indicateur de chargement pendant la vérification
  if (isLoading) {
    return <>{loadingComponent || <div>Chargement...</div>}</>;
  }


  // Si l'utilisateur n'est pas autorisé mais qu'un composant personnalisé est fourni
  if (unauthorizedComponent && user) {
    return <>{unauthorizedComponent}</>;
  }

  // Si l'utilisateur est autorisé, afficher les enfants
  return <>{children}</>;
}

/**
 * HOC pour protéger un composant avec des rôles spécifiques
 * @param Component Le composant à protéger
 * @param options Options de protection
 */
export function withRoleProtected<T>(
  Component: React.ComponentType<T>,
  options?: Omit<ProtectedRouteProps, 'children'>
) {
  return function ProtectedComponent(props: T) {
    return (
      <ProtectedRoute {...options}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
