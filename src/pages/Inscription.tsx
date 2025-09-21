import React, { useState } from "react";
import { supabase } from '@/lib/supabase';
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Step = "form" | "success" | "error";

const ROLE = "chauffeur"; // ou "exploiteur" si vous souhaitez

export default function Inscription() {
  const [form, setForm] = useState({ email: "", password: "", password2: "" });
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Validation basique
  function validateForm() {
    if (!form.email || !form.password || !form.password2) {
      return "Veuillez remplir tous les champs.";
    }
    if (!/^[\w-.]+@[\w-]+\.\w{2,}$/.test(form.email)) {
      return "Email invalide.";
    }
    if (form.password.length < 8) {
      return "Le mot de passe doit contenir au moins 8 caractères.";
    }
    if (form.password !== form.password2) {
      return "Les mots de passe ne correspondent pas.";
    }
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = validateForm();
    if (validation) {
      setError(validation);
      return;
    }

    setLoading(true);

    // 1 - On crée l'utilisateur avec Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin + "/onboarding",
      },
    });

    if (signUpError || !data.user) {
      setError(signUpError?.message || "Erreur lors de l'inscription.");
      setLoading(false);
      return;
    }

    // 2 - Récupérer l'ID utilisateur Supabase
    const user = data.user;

    // (! data.user.id parfois non dispo si email à valider => vous pouvez adapter si besoin).
    try {
      // IMPORTANT: attendre que le compte soit activé (email reçu/click) avant de continuer
      // On insère le rôle si l'utilisateur est déjà confirmé
      // Sinon demander à l'utilisateur de valider l'email
      if (!user.id) {
        setStep("success");
        setLoading(false);
        return;
      }

      // 2 - Ajout du rôle dans user_roles (RLS : l'utilisateur doit être connecté et correspondre à auth.uid)
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert([{ user_id: user.id, role: ROLE }]);
      if (roleError) {
        setError("Compte créé, mais impossible d'attribuer le rôle (" + roleError.message + ")");
        setLoading(false);
        return;
      }

      setStep("success");
      setLoading(false);

      // On attend 1s puis on redirige (pour UX)
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 1000);
    } catch (err: any) {
      setError(
        "Erreur technique lors de l'inscription. Veuillez réessayer plus tard."
      );
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-onelog-nuit/10 font-['PT Sans']">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        {step === "form" && (
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <h1 className="text-2xl font-bold text-onelog-nuit mb-2">Créer un compte</h1>
            <div>
              <label className="block mb-1 font-bold" htmlFor="email">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                className="w-full"
                required
                value={form.email}
                onChange={handleChange}
                disabled={loading}
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold" htmlFor="password">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                className="w-full"
                required
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                placeholder="Votre mot de passe"
              />
            </div>
            <div>
              <label className="block mb-1 font-bold" htmlFor="password2">
                Confirmer le mot de passe
              </label>
              <Input
                id="password2"
                name="password2"
                type="password"
                autoComplete="new-password"
                className="w-full"
                required
                value={form.password2}
                onChange={handleChange}
                disabled={loading}
                placeholder="Confirmez votre mot de passe"
              />
            </div>
            {error && (
              <div className="text-red-600 text-sm font-medium rounded bg-red-50 px-3 py-2">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full mt-2"
              disabled={loading}
            >
              {loading ? "Création du compte..." : "S'inscrire"}
            </Button>
            <p className="text-center text-sm mt-3">
              Déjà un compte ?{" "}
              <a
                href="/auth"
                className="text-onelog-bleu underline font-semibold"
              >
                Se connecter
              </a>
            </p>
          </form>
        )}
        {step === "success" && (
          <div className="flex flex-col items-center py-8">
            <span className="text-5xl mb-3">🚚</span>
            <h2 className="text-xl font-bold mb-1 text-green-600">Inscription réussie</h2>
            <p className="mb-2 text-center text-onelog-nuit">
              Votre compte a bien été créé !
            </p>
            <p className="mb-4 text-center text-onelog-nuit">
              Redirection vers le tableau de bord...
            </p>
          </div>
        )}
        {step === "error" && (
          <div className="text-red-600 text-center py-6">
            <h2 className="text-xl font-bold mb-1">Erreur</h2>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
