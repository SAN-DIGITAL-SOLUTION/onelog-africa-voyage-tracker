
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useAuth } from "./useAuth";
import { fetchUserRole } from "./useFetchUserRole";

export type AppRole = "admin" | "exploiteur" | "chauffeur" | "client" | null;

type RoleContextType = {
  role: AppRole;
  setRole: (role: AppRole) => void;
  loadingRole: boolean;
  setLoadingRole: (v: boolean) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AppRole>(null);
  const [loadingRole, setLoadingRole] = useState<boolean>(true); // Initialisé à true pour refléter l'état de chargement initial
  const { user, loading: authLoading } = useAuth();

  // Écouter les changements d'utilisateur et charger le rôle
  useEffect(() => {
    console.log('[useRole] État de l\'authentification:', { authLoading, user: user ? 'utilisateur connecté' : 'pas d\'utilisateur' });
    
    // Si l'authentification est encore en cours, ne pas changer loadingRole
    if (authLoading) {
      console.log('[useRole] Authentification en cours, attente...');
      return;
    }
    
    if (user) {
      console.log('[useRole] Utilisateur connecté, récupération du rôle...');
      setLoadingRole(true);
      
      fetchUserRole(user.id)
        .then((fetchedRole) => {
          console.log('[useRole] Rôle récupéré avec succès:', fetchedRole);
          setRole(fetchedRole);
          setLoadingRole(false);
          
          // Identification PostHog
          import('../lib/posthog')
            .then(({ default: posthog }) => {
              posthog.identify(user.id, {
                email: user.email,
                role: fetchedRole,
              });
            })
            .catch((error) => {
              console.warn('[useRole] Erreur PostHog (non bloquante):', error);
            });
        })
        .catch((error) => {
          console.error('[useRole] Erreur lors du chargement du rôle:', error);
          setRole(null);
          setLoadingRole(false);
        });
    } else {
      console.log('[useRole] Pas d\'utilisateur connecté, réinitialisation du rôle');
      // Pas d'utilisateur connecté, pas de rôle
      setRole(null);
      setLoadingRole(false);
    }
  }, [user, authLoading]);

  return (
    <RoleContext.Provider value={{ role, setRole, loadingRole, setLoadingRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole doit être utilisé dans RoleProvider");
  return ctx;
}
