
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [processing, setProcessing] = useState(false);

  const { user, signIn, signUp, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged
  if (user) {
    navigate((location.state as any)?.from?.pathname || "/dashboard", { replace: true });
    return null;
  }

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
    <div className="flex min-h-screen items-center justify-center bg-onelog-nuit/5">
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
            {processing ? (isLogin ? "Connexion..." : "Inscription...") : isLogin ? "Se connecter" : "Créer un compte"}
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
