import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ASSIGNMENT_MODE } from "@/config";

const ROLES = [
  { value: "client", label: "Client" },
  { value: "chauffeur", label: "Chauffeur" },
  { value: "exploitant", label: "Exploitant" }
];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [requestedRole, setRequestedRole] = useState("");
  const [roleStatus, setRoleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!user) {
    return (
      <main className="container mx-auto pt-16 text-center">
        <div>Chargement...</div>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Mise à jour du profil utilisateur (nom, téléphone)
      const { error: upError } = await supabase
        .from("users")
        .update({ fullname, phone })
        .eq("id", user.id);
      if (upError) throw upError;

      if (ROLE_ASSIGNMENT_MODE === "self_service") {
        // Attribution immédiate du rôle
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role, role_status: "approved" }, { onConflict: "user_id" });
        await supabase.auth.updateUser({ data: { role, fullname, phone } });
        await refreshUser?.();
        if (role === "client") {
          navigate("/dashboard-client");
        } else if (role === "chauffeur") {
          navigate("/missions-chauffeur");
        } else if (role === "exploitant") {
          navigate("/dashboard-exploitant");
        } else {
          setError("Rôle non défini. Veuillez contacter l'administrateur.");
        }
      } else if (ROLE_ASSIGNMENT_MODE === "hybrid") {
        // Demande de rôle, en attente de validation admin
        await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, requested_role: requestedRole, role_status: "pending" }, { onConflict: "user_id" });
        await supabase.auth.updateUser({ data: { requested_role: requestedRole, fullname, phone } });
        setRoleStatus("pending");
        setError("Votre demande de rôle a été envoyée. Un administrateur doit la valider.");
      } else {
        // admin_only: pas de sélection de rôle, l'admin doit l'attribuer
        await supabase.auth.updateUser({ data: { fullname, phone } });
        setError("Votre profil est enregistré. Un administrateur vous attribuera un rôle prochainement.");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto pt-16 max-w-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Configuration du compte</h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-1 font-medium">Nom complet</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={fullname}
            onChange={e => setFullname(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">Téléphone</label>
          <input
            type="tel"
            className="w-full border rounded px-3 py-2"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            required
          />
        </div>
        {/* Sélection du rôle selon le mode */}
        {ROLE_ASSIGNMENT_MODE === "self_service" && (
          <div>
            <label className="block mb-1 font-medium">Rôle</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={role}
              onChange={e => setRole(e.target.value)}
              required
            >
              <option value="">Sélectionner un rôle</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
        )}
        {ROLE_ASSIGNMENT_MODE === "hybrid" && (
          <div>
            <label className="block mb-1 font-medium">Demander un rôle</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={requestedRole}
              onChange={e => setRequestedRole(e.target.value)}
              required
            >
              <option value="">Sélectionner un rôle</option>
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            {roleStatus === "pending" && (
              <div className="text-yellow-600 text-center mt-2">
                Votre demande est en attente de validation par un administrateur.
              </div>
            )}
          </div>
        )}
        {ROLE_ASSIGNMENT_MODE === "admin_only" && (
          <div className="text-center text-sm text-gray-500">
            Le choix du rôle n'est pas disponible. Un administrateur vous attribuera un rôle prochainement.
          </div>
        )}
        {error && <div className="text-red-600 text-center">{error}</div>}
        <button
          type="submit"
          className="w-full bg-onelog-bleu text-white py-2 rounded font-semibold"
          disabled={loading}
        >
          {loading ? "Enregistrement..." : "Valider et accéder à mon espace"}
        </button>
      </form>
    </main>
  );
}
