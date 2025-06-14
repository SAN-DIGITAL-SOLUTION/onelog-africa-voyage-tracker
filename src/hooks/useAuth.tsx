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
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    const redirectTo = `${window.location.origin}/`;
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

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signUp, signIn, signOut }}
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
