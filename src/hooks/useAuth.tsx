import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from '@/lib/supabase';
import type { User, Session } from "@supabase/supabase-js";
import { fetchUserRole } from "./useFetchUserRole";

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

  useEffect(() => {
    console.log('[useAuth] Initialisation du hook useAuth');
    
    // 1. Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[useAuth] Événement d'authentification: ${event}`, { session });
      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);
    });

    // 2. Check for existing session after
    console.log('[useAuth] Vérification de la session existante...');
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('[useAuth] Session récupérée:', session);
      setSession(session);
      setUser(session?.user ?? null);

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  // Méthode pour rafraîchir le user après onboarding
  const refreshUser = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    setUser(session?.user ?? null);
    // Le rôle sera rafraîchi par RoleProvider qui écoute les changements d'user
  }, []);

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
