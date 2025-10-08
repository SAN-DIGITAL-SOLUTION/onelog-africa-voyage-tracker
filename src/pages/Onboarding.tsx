import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from '@/lib/supabase';
import { useAuth } from "@/hooks/useAuth";
import { ROLE_ASSIGNMENT_MODE } from "@/config";
import { AppRole } from "@/hooks/useRole";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Phone, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import Footer from "@/components/Footer";

const ROLES = [
  { value: "client" as AppRole, label: "Client" },
  { value: "chauffeur" as AppRole, label: "Chauffeur" },
  { value: "exploiteur" as AppRole, label: "Exploiteur" },
  { value: "admin" as AppRole, label: "Administrateur" }
];

export default function Onboarding() {
  const { user, refreshUser } = useAuth();
  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<AppRole | null>(null);
  const [requestedRole, setRequestedRole] = useState<AppRole | null>(null);
  const [roleStatus, setRoleStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Gérer la redirection avec useEffect
  useEffect(() => {
    if (!user && !isRedirecting) {
      setIsRedirecting(true);
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, isRedirecting]);

  // Afficher un indicateur de chargement pendant la redirection
  if (!user) {
    return (
      <main className="container mx-auto pt-16 text-center">
        <div>Redirection vers la page de connexion...</div>
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
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ user_id: user.id, role, role_status: "approved" }, { onConflict: "user_id" });
        
        if (roleError) throw roleError;
        
        // Mise à jour des métadonnées utilisateur
        const { error: updateError } = await supabase.auth.updateUser({ 
          data: { 
            role, 
            fullname, 
            phone,
            onboarding_complete: true 
          } 
        });
        
        if (updateError) throw updateError;
        
        await refreshUser?.();
        
        // Redirection basée sur le rôle
        if (role) {
          navigate("/"); // La redirection sera gérée par le composant Index
        } else {
          setError("Rôle non défini. Veuillez contacter l'administrateur.");
        }
      } else if (ROLE_ASSIGNMENT_MODE === "hybrid") {
        // Demande de rôle, en attente de validation admin
        const { error: roleError } = await supabase
          .from("user_roles")
          .upsert({ 
            user_id: user.id, 
            requested_role: requestedRole, 
            role_status: "pending" 
          }, { onConflict: "user_id" });
          
        if (roleError) throw roleError;
        
        const { error: updateError } = await supabase.auth.updateUser({ 
          data: { 
            requested_role: requestedRole, 
            fullname, 
            phone,
            onboarding_complete: true 
          } 
        });
        
        if (updateError) throw updateError;
        
        setRoleStatus("pending");
        setError("Votre demande de rôle a été envoyée. Un administrateur doit la valider.");
      } else {
        // admin_only: pas de sélection de rôle, l'admin doit l'attribuer
        const { error: updateError } = await supabase.auth.updateUser({ 
          data: { 
            fullname, 
            phone,
            onboarding_complete: true 
          } 
        });
        
        if (updateError) throw updateError;
        
        // Rafraîchir les données utilisateur avant la redirection
        await refreshUser?.();
        
        // Rediriger vers la page d'attente d'approbation
        navigate("/waiting-approval");
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la mise à jour du profil");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F6FAF9] relative">
      {/* Logo extrême gauche */}
      <div className="absolute top-6 left-6 z-20 flex items-center">
        <img src="/onelog-africa-logo-whitebg.png" alt="Logo OneLog Africa" style={{height:'48px', width:'auto', display:'block'}} />
      </div>
      {/* Bouton retour */}
      <div className="flex items-center mt-6 mb-2 w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => navigate('/auth')}
          className="flex items-center text-[#1A3C40] hover:text-[#F9A825] font-medium text-sm px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-[#F9A825]"
          aria-label="Retour à l'inscription"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à l'inscription
        </button>
      </div>
      {/* Icône centrale et titre */}
      <div className="flex flex-col items-center mt-2 mb-2">
        <div className="bg-white rounded-full shadow-lg p-3 border-2 border-[#F9A825]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-[#1A3C40]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="8" r="4" stroke="#1A3C40" strokeWidth="2" fill="#F6FAF9" />
            <path stroke="#1A3C40" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 20c0-2.21 3.58-4 6-4s6 1.79 6 4" fill="#F6FAF9" />
          </svg>
        </div>
        <span className="text-xl font-bold tracking-tight mt-2" style={{color: '#1A3C40'}}>OneLog <span style={{color: '#F9A825'}}>Africa</span></span>
      </div>
      <div className="flex flex-col items-center justify-center flex-1">
        <Card className="w-full max-w-md mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold" style={{color: '#1A3C40'}}>Bienvenue sur OneLog Africa</CardTitle>
            <CardDescription className="text-center">Complétez votre profil pour accéder à la plateforme.</CardDescription>
          </CardHeader>
        
          <form onSubmit={handleSubmit}>
  <CardContent className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="fullname">Nom complet</Label>
      <div className="relative">
        <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="fullname"
          type="text"
          placeholder="Votre nom complet"
          className="pl-10"
          value={fullname}
          onChange={e => setFullname(e.target.value)}
          required
        />
      </div>
    </div>
    <div className="space-y-2">
      <Label htmlFor="phone">Téléphone</Label>
      <div className="relative">
        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="phone"
          type="tel"
          placeholder="Votre numéro de téléphone"
          className="pl-10"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          required
        />
      </div>
    </div>
            
            {ROLE_ASSIGNMENT_MODE === "self_service" && (
              <div className="space-y-2">
                <Label>Rôle</Label>
                <Select 
                  value={role || ''} 
                  onValueChange={(value) => setRole(value as AppRole)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {ROLE_ASSIGNMENT_MODE === "hybrid" && (
              <div className="space-y-2">
                <Label>Demander un rôle</Label>
                <Select 
                  value={requestedRole || ''} 
                  onValueChange={(value) => setRequestedRole(value as AppRole)}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {roleStatus === "pending" && (
                  <div className="text-yellow-600 text-sm mt-2 p-2 bg-yellow-50 rounded-md">
                    Votre demande est en attente de validation par un administrateur.
                  </div>
                )}
              </div>
            )}
            
            {ROLE_ASSIGNMENT_MODE === "admin_only" && (
              <div className="text-center text-sm text-muted-foreground p-3 bg-muted/50 rounded-md">
                Le choix du rôle n'est pas disponible. Un administrateur vous attribuera un rôle prochainement.
              </div>
            )}
            
            {error && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Enregistrement en cours..." : "Valider et continuer"}
            </Button>
            <div className="text-center text-xs text-muted-foreground mt-4">
              En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
    <Footer />
    </div>
  );
}
