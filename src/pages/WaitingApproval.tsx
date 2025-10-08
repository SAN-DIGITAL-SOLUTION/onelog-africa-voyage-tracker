import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function WaitingApproval() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Vérifier périodiquement si le rôle a été approuvé
  useEffect(() => {
    if (user) {
      const checkRoleApproval = setInterval(async () => {
        // Vérifier si l'utilisateur a maintenant un rôle
        const { data } = await fetch(`/api/user/check-role?userId=${user.id}`).then(res => res.json());
        if (data?.role) {
          // Rediriger vers la page d'accueil qui gérera la redirection en fonction du rôle
          navigate("/");
        }
      }, 30000); // Vérifier toutes les 30 secondes

      return () => clearInterval(checkRoleApproval);
    }
  }, [user, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-2xl font-bold text-gray-900">
            En attente d'approbation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Votre compte est en attente de validation par un administrateur.
            Vous recevrez une notification dès que votre demande sera traitée.
          </p>
          <div className="mt-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Cette page se mettra à jour automatiquement une fois votre compte approuvé.
          </p>
        </div>
      </div>
    </main>
  );
}
