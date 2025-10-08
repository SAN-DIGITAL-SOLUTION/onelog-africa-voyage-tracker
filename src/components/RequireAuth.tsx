
import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";

type RequireAuthProps = {
  children: React.ReactNode;
  role?: string;
};

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const { user, loading, session } = useAuth() as any;
  const location = useLocation();

  // Récupère le rôle de l'utilisateur depuis le token (si présent)
  let userRole = undefined;
  if (session?.user?.role) {
    userRole = session.user.role;
  } else if ((user as any)?.role) {
    userRole = (user as any).role;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <span className="animate-spin h-7 w-7 border-4 border-onelog-bleu border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  if (role && userRole && userRole !== role) {
    // Redirige si le rôle ne correspond pas
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}
