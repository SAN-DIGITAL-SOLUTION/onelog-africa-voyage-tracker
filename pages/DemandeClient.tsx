import DemandeForm from "@/components/DemandeForm";
import SuccessModal from "@/components/SuccessModal";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function DemandeClient() {
  const [success, setSuccess] = useState<any>(null);
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier le rôle de l'utilisateur connecté
    const fetchRole = async () => {
      const user = supabase.auth.user();
      if (!user) {
        navigate("/auth");
        return;
      }
      // Supposons que le rôle est stocké dans le profil utilisateur (table 'profiles')
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (error || !data || data.role !== "client") {
        navigate("/404");
        return;
      }
      setRole(data.role);
    };
    fetchRole();
  }, [navigate]);

  if (!role) return null; // Ou un loader

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-8 px-2">
      <h1 className="text-2xl font-bold text-center mb-6">Créer une nouvelle demande de transport</h1>
      {!success ? (
        <DemandeForm onSuccess={setSuccess} />
      ) : (
        <SuccessModal demande={success} />
      )}
    </div>
  );
}
