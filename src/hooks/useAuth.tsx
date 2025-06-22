import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { fetchUserRole } from "./useFetchUserRole";
import { useRole } from "./useRole";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser?: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Ajout du contexte de rôle pour hydrater après connexion
  const { setRole, setLoadingRole } = useRole ? useRole() : { setRole: () => {}, setLoadingRole: () => {} };

  useEffect(() => {
    // 1. Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Charger le rôle _uniquement_ si l'utilisateur est connecté
      if (session?.user) {
        setLoadingRole?.(true);
        fetchUserRole(session.user.id).then((role) => {
          setRole?.(role);
          setLoadingRole?.(false);
          // Identification PostHog
          import('../lib/posthog').then(({ default: posthog }) => {
            posthog.identify(session.user.id, {
              email: session.user.email,
              role,
            });
          });
        });
      } else {
        setRole?.(null);
        setLoadingRole?.(false);
      }
      setLoading(false);
    });

    // 2. Check for existing session after
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      // Idem ici
      if (session?.user) {
        setLoadingRole?.(true);
        fetchUserRole(session.user.id).then((role) => {
          setRole?.(role);
          setLoadingRole?.(false);
          // Identification PostHog
          import('../lib/posthog').then(({ default: posthog }) => {
            posthog.identify(session.user.id, {
              email: session.user.email,
              role,
            });
          });
        });
      } else {
        setRole?.(null);
        setLoadingRole?.(false);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setRole, setLoadingRole]);

  const signUp = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const redirectTo = `${window.location.origin}/onboarding`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    });
    setLoading(false);
    return { error: error ? error.message : null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    return { error: error ? error.message : null };
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
  }, []);

  // Méthode pour rafraîchir le user et le rôle après onboarding
  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
    if (session?.user) {
      setLoadingRole?.(true);
      const role = await fetchUserRole(session.user.id);
      setRole?.(role);
      setLoadingRole?.(false);
    } else {
      setRole?.(null);
      setLoadingRole?.(false);
    }
  }, [setRole, setLoadingRole]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
