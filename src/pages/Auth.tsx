import { useState, useEffect } from "react";
import { motion, Variants } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Lock, Eye, EyeOff, Truck, UserPlus, LogIn } from "lucide-react";
import OnboardingStepper from "./OnboardingStepper";

// Animation variants for Framer Motion
const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.2, ease: [0.65, 0, 0.35, 1] }
  }
};

const slideIn: Variants = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 300
    }
  },
  exit: { 
    x: -50, 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ email: "", password: "" });
  const [processing, setProcessing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user, signIn, signUp, loading } = useAuth();
  const { role, loadingRole } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  // Restore last auth mode from localStorage
  useEffect(() => {
    const savedMode = localStorage.getItem('authMode');
    if (savedMode === 'signup') {
      setIsLogin(false);
    }
  }, []);
  
  // Save auth mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('authMode', isLogin ? 'login' : 'signup');
  }, [isLogin]);

  // Handle user redirection based on auth state and role
  useEffect(() => {
    if (loading || loadingRole) return;
    
    const currentPath = location.pathname;
    if (!user) return;
    
    const onboardingDone = localStorage.getItem("onelog_onboarding_done");
    if (currentPath === "/onboarding") return;
    
    if (!onboardingDone) {
      navigate("/onboarding", { replace: true });
      return;
    }
    
    let targetPath = "/";
    
    if (role === null) {
      targetPath = "/no-role";
    } else if (role === "admin") {
      targetPath = "/admin-dashboard";
    } else if (role === "exploiteur") {
      targetPath = "/exploiteur-dashboard";
    } else if (role === "chauffeur") {
      targetPath = "/chauffeur-dashboard";
    } else if (role === "client") {
      targetPath = "/client-dashboard";
    }
    
    if (currentPath !== targetPath) {
      navigate(targetPath, { replace: true });
    }
  }, [user, loading, role, loadingRole, navigate, location.pathname]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    setIsSubmitting(true);
    
    try {
      let errorMsg = null;
      if (isLogin) {
        const { error } = await signIn(form.email, form.password);
        errorMsg = error;
      } else {
        const { error } = await signUp(form.email, form.password);
        errorMsg = error;
      }
      
      if (errorMsg) {
        toast({ 
          title: "Erreur", 
          description: errorMsg, 
          variant: "destructive",
          duration: 3000
        });
      } else {
        toast({
          title: isLogin ? "Connexion réussie" : "Inscription réussie",
          description: isLogin
            ? "Bienvenue sur OneLog Africa !"
            : "Vérifiez vos emails pour activer votre compte.",
          duration: 3000
        });
        setShowOnboarding(true);
        localStorage.removeItem("onelog_onboarding_done");
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
        duration: 3000
      });
    } finally {
      setProcessing(false);
      setIsSubmitting(false);
    }
  }

  if (showOnboarding) {
    return (
      <OnboardingStepper
        key="onboarding-stepper"
        onFinish={() => {
          localStorage.setItem("onelog_onboarding_done", "1");
          setShowOnboarding(false);
          if (["admin", "exploiteur", "chauffeur"].includes(role)) {
            navigate("/dashboard", { replace: true });
          } else if (role === null) {
            navigate("/no-role", { replace: true });
          }
        }}
      />
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/10 p-4"
      role="main"
      aria-label="Page d'authentification"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 overflow-hidden">
          <motion.div
            key={isLogin ? 'login' : 'signup'}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={fadeIn}
          >
            <CardHeader className="bg-primary/5 border-b" role="region" aria-label="En-tête de la carte d'authentification">
              <div className="flex flex-col items-center space-y-2" role="presentation">
                <motion.div 
                  className="p-3 rounded-full bg-primary/10"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  role="img"
                  aria-label="Logo OneLog Africa"
                >
                  <Truck className="h-8 w-8 text-primary" aria-hidden="true" />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-center" id="auth-title">
                  {isLogin ? "Connexion" : "Créer un compte"}
                </CardTitle>
                <CardDescription className="text-center" id="auth-description">
                  {isLogin
                    ? "Accédez à votre espace de suivi de voyage"
                    : "Rejoignez notre plateforme de logistique"}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="pt-8" role="region" aria-labelledby="auth-title" aria-describedby="auth-description">
              <form onSubmit={handleSubmit} className="space-y-6" aria-label="Formulaire d'authentification">
                <motion.div 
                  className="space-y-2"
                  variants={slideIn}
                >
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    <span>Adresse email</span>
                  </Label>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="votre@email.com"
                      required
                      className="pl-10 bg-background/50 transition-all duration-200"
                      disabled={processing}
                      autoComplete={isLogin ? "email" : "new-email"}
                      aria-busy={processing}
                      aria-required="true"
                      aria-invalid={form.email && !/\S+@\S+\.\S+/.test(form.email) ? "true" : "false"}
                      aria-describedby="email-help"
                    />
                    <p id="email-help" className="sr-only">
                      Format attendu : exemple@domaine.com
                    </p>
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  </motion.div>
                </motion.div>

                <motion.div 
                  className="space-y-2"
                  variants={slideIn}
                  transition={{ delay: 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center gap-2">
                      <Lock className="h-4 w-4" aria-hidden="true" />
                      <span>Mot de passe</span>
                    </Label>
                    {isLogin && (
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-muted-foreground hover:underline hover:text-primary transition-colors"
                        tabIndex={processing ? -1 : 0}
                        aria-disabled={processing}
                      >
                        Mot de passe oublié ?
                      </Link>
                    )}
                  </div>
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="pl-10 pr-10 bg-background/50 transition-all duration-200"
                      disabled={processing}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                      aria-busy={processing}
                      aria-required="true"
                      aria-invalid={form.password && form.password.length < 6 ? "true" : "false"}
                      aria-describedby="password-requirements"
                    />
                    <p id="password-requirements" className="text-xs text-muted-foreground mt-1">
                      Le mot de passe doit contenir au moins 6 caractères
                    </p>
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full p-1"
                      tabIndex={0}
                      disabled={processing}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                      aria-controls="password"
                      aria-expanded={showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" aria-hidden="true" />
                      ) : (
                        <Eye className="h-4 w-4" aria-hidden="true" />
                      )}
                    </button>
                  </motion.div>
                </motion.div>

                <motion.div
                  variants={slideIn}
                  transition={{ delay: 0.2 }}
                >
                  <Button 
                    type="submit" 
                    className="w-full mt-8 group relative overflow-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:outline-none"
                    disabled={processing}
                    aria-busy={processing}
                    aria-live="polite"
                  >
                    <motion.span
                      className="absolute inset-0 w-0 bg-primary/10 transition-all duration-300 group-hover:w-full"
                      initial={{ width: 0 }}
                      animate={{ width: isSubmitting ? '100%' : '0%' }}
                      transition={{ duration: 0.3 }}
                    />
                    <span className="relative z-10 flex items-center justify-center">
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLogin ? "Connexion..." : "Inscription..."}
                        </>
                      ) : (
                        <>
                          {isLogin ? (
                            <>
                              <LogIn className="mr-2 h-4 w-4" />
                              Se connecter
                            </>
                          ) : (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Créer un compte
                            </>
                          )}
                        </>
                      )}
                    </span>
                  </Button>
                </motion.div>
              </form>
            </CardContent>
            
            <motion.div
              variants={fadeIn}
              transition={{ delay: 0.3 }}
            >
              <CardFooter className="bg-muted/30 py-4 border-t">
                <div className="text-center w-full text-sm text-muted-foreground">
                  {isLogin ? "Vous n'avez pas de compte ?" : "Vous avez déjà un compte ?"}{' '}
                  <button
                    type="button"
                    onClick={() => !processing && setIsLogin(!isLogin)}
                    className="font-medium text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded px-1 py-0.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={processing}
                    aria-expanded={!isLogin}
                    aria-controls={isLogin ? "signup-form" : "login-form"}
                  >
                    {isLogin ? "S'inscrire" : "Se connecter"}
                  </button>
                </div>
              </CardFooter>
            </motion.div>
          </motion.div>
        </Card>
      </motion.div>
    </div>
  );
}
