
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [processing, setProcessing] = useState(false);

  const { user, signIn, signUp, loading } = useAuth();
  const { role, loadingRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirection selon le rôle dès qu'on a tout chargé
  useEffect(() => {
    if (user && !loading && !loadingRole) {
      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else if (role === "exploiteur") {
        navigate("/exploiteur", { replace: true });
      } else if (role === "chauffeur") {
        navigate("/chauffeur", { replace: true });
      } else if (role === null) {
        navigate("/no-role", { replace: true });
      }
    }
  }, [user, loading, role, loadingRole, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    let errorMsg = null;
    if (isLogin) {
      const { error } = await signIn(form.email, form.password);
      errorMsg = error;
    } else {
      const { error } = await signUp(form.email, form.password);
      errorMsg = error;
    }
    setProcessing(false);
    if (errorMsg) {
      toast({ title: "Erreur", description: errorMsg, variant: "destructive" });
    } else {
      toast({
        title: isLogin ? "Connexion réussie" : "Inscription réussie",
        description: isLogin
          ? "Bienvenue sur OneLog Africa !"
          : "Vérifiez vos emails pour activer votre compte.",
      });
      // On redirige, ou on attend la validation email
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-onelog-nuit/5 font-['PT Sans']">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-sm w-full">
        <h1 className="text-2xl font-semibold mb-4">
          {isLogin ? "Connexion" : "Inscription"}
        </h1>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-bold">Email</label>
            <Input
              type="email"
              className="w-full"
              required
              autoComplete="username"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={processing}
            />
          </div>
          <div>
            <label className="block mb-1 font-bold">Mot de passe</label>
            <Input
              type="password"
              className="w-full"
              required
              autoComplete={isLogin ? "current-password" : "new-password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              disabled={processing}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={processing || loading}
          >
            {processing
              ? isLogin
                ? "Connexion..."
                : "Inscription..."
              : isLogin
                ? "Se connecter"
                : "Créer un compte"}
          </Button>
        </form>
        <div className="text-sm text-onelog-nuit mt-4 text-center">
          {isLogin ? (
            <>
              Pas encore de compte ?{" "}
              <button
                className="text-onelog-bleu font-semibold underline"
                disabled={processing}
                onClick={() => setIsLogin(false)}
              >
                S’inscrire
              </button>
            </>
          ) : (
            <>
              Déjà inscrit ?{" "}
              <button
                className="text-onelog-bleu font-semibold underline"
                disabled={processing}
                onClick={() => setIsLogin(true)}
              >
                Se connecter
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
