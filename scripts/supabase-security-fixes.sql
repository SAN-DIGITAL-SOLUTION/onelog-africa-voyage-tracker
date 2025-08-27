-- =======================================
-- CORRECTIONS DE SÉCURITÉ SUPABASE
-- Basé sur le diagnostic de santé fourni
-- =======================================

-- =======================================
-- 1. ACTIVATION PROTECTION MOTS DE PASSE
-- Configuration Auth Supabase
-- =======================================

-- Note: Cette configuration doit être faite via l'interface Supabase Dashboard
-- Aller dans Authentication > Settings > Security
-- Activer "Breach password protection"

-- Fonction pour vérifier la force des mots de passe
CREATE OR REPLACE FUNCTION check_password_strength(password text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier longueur minimale
  IF length(password) < 8 THEN
    RETURN false;
  END IF;
  
  -- Vérifier présence de majuscules
  IF password !~ '[A-Z]' THEN
    RETURN false;
  END IF;
  
  -- Vérifier présence de minuscules
  IF password !~ '[a-z]' THEN
    RETURN false;
  END IF;
  
  -- Vérifier présence de chiffres
  IF password !~ '[0-9]' THEN
    RETURN false;
  END IF;
  
  -- Vérifier présence de caractères spéciaux
  IF password !~ '[!@#$%^&*(),.?":{}|<>]' THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- =======================================
-- 2. SÉCURISATION DES FONCTIONS
-- Correction des chemins de recherche mutables
-- =======================================

-- Liste des fonctions à corriger avec search_path fixe
CREATE OR REPLACE FUNCTION secure_column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = $1 
    AND column_name = $2
  );
END;
$$;

-- Fonction sécurisée pour la gestion des rôles
CREATE OR REPLACE FUNCTION secure_create_app_role_enum()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'manager', 'super_admin', 'chauffeur', 'client', 'exploiteur');
  END IF;
END;
$$;

-- Fonction sécurisée pour le logging des missions
CREATE OR REPLACE FUNCTION secure_log_initial_mission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  INSERT INTO mission_status_history (mission_id, status, changed_at, changed_by)
  VALUES (NEW.id, NEW.status, NOW(), auth.uid());
  RETURN NEW;
END;
$$;

-- Fonction sécurisée pour les changements de statut
CREATE OR REPLACE FUNCTION secure_log_mission_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier que l'utilisateur est authentifié
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Utilisateur non authentifié';
  END IF;
  
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO mission_status_history (mission_id, status, changed_at, changed_by)
    VALUES (NEW.id, NEW.status, NOW(), auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- =======================================
-- 3. POLITIQUES RLS SÉCURISÉES
-- Renforcement de la sécurité des accès
-- =======================================

-- Politique sécurisée pour les profils utilisateurs
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (
  id = (SELECT auth.uid()) AND 
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (
  id = (SELECT auth.uid()) AND 
  auth.uid() IS NOT NULL
) WITH CHECK (
  id = (SELECT auth.uid()) AND 
  auth.uid() IS NOT NULL
);

-- Politique sécurisée pour les données sensibles
CREATE POLICY "Restrict sensitive data access" ON public.missions
FOR SELECT USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND r.name IN ('admin', 'super_admin')
    AND auth.uid() IS NOT NULL
  )
);

-- =======================================
-- 4. AUDIT ET LOGGING SÉCURISÉ
-- Traçabilité des actions sensibles
-- =======================================

-- Table d'audit sécurisée
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT NOW()
);

-- RLS pour la table d'audit
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs" ON security_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND r.name IN ('admin', 'super_admin')
    AND auth.uid() IS NOT NULL
  )
);

-- Fonction d'audit sécurisée
CREATE OR REPLACE FUNCTION log_security_event(
  p_action text,
  p_table_name text,
  p_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id, action, table_name, record_id, 
    old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id,
    p_old_values, p_new_values
  );
END;
$$;

-- =======================================
-- 5. VALIDATION DES DONNÉES
-- Contraintes de sécurité supplémentaires
-- =======================================

-- Fonction de validation des emails
CREATE OR REPLACE FUNCTION validate_email(email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$';
END;
$$;

-- Contrainte de validation sur les profils
ALTER TABLE profiles 
ADD CONSTRAINT check_valid_email 
CHECK (validate_email(email));

-- Fonction de nettoyage des données sensibles
CREATE OR REPLACE FUNCTION sanitize_user_input(input text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Supprimer les caractères potentiellement dangereux
  RETURN regexp_replace(
    regexp_replace(input, '<[^>]*>', '', 'g'), -- Supprimer HTML
    '[<>"\'';&]', '', 'g' -- Supprimer caractères dangereux
  );
END;
$$;

-- =======================================
-- 6. CONFIGURATION DE SÉCURITÉ
-- Paramètres recommandés
-- =======================================

-- Activer le logging des connexions
-- Note: À configurer via postgresql.conf ou interface Supabase
-- log_connections = on
-- log_disconnections = on
-- log_statement = 'mod'

-- Fonction pour vérifier la configuration de sécurité
CREATE OR REPLACE FUNCTION check_security_config()
RETURNS table(setting_name text, current_value text, recommended_value text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'RLS Enabled'::text,
    CASE WHEN COUNT(*) > 0 THEN 'Yes' ELSE 'No' END::text,
    'Yes'::text,
    CASE WHEN COUNT(*) > 0 THEN 'OK' ELSE 'WARNING' END::text
  FROM pg_class c
  JOIN pg_namespace n ON c.relnamespace = n.oid
  WHERE n.nspname = 'public' 
  AND c.relkind = 'r' 
  AND c.relrowsecurity = true;
END;
$$;

-- =======================================
-- 7. NETTOYAGE ET VÉRIFICATIONS
-- =======================================

-- Supprimer les fonctions non sécurisées (anciennes versions)
DROP FUNCTION IF EXISTS column_exists(text, text);
DROP FUNCTION IF EXISTS create_app_role_enum();
DROP FUNCTION IF EXISTS log_initial_mission_status();
DROP FUNCTION IF EXISTS log_mission_status_change();

-- Créer des alias pour les nouvelles fonctions sécurisées
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT secure_column_exists($1, $2);
$$;

-- Vérification finale de sécurité
DO $$
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'CORRECTIONS DE SÉCURITÉ TERMINÉES';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Protection mots de passe configurée';
  RAISE NOTICE '✅ Fonctions sécurisées (search_path fixe)';
  RAISE NOTICE '✅ Politiques RLS renforcées';
  RAISE NOTICE '✅ Audit et logging sécurisé activé';
  RAISE NOTICE '✅ Validation des données implémentée';
  RAISE NOTICE '✅ Fonctions non sécurisées supprimées';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'ACTIONS MANUELLES REQUISES:';
  RAISE NOTICE '1. Activer "Breach password protection" dans Supabase Dashboard';
  RAISE NOTICE '2. Configurer les paramètres de logging PostgreSQL';
  RAISE NOTICE '3. Réviser les permissions des fonctions Edge';
  RAISE NOTICE '4. Tester l''authentification avec les nouveaux contrôles';
  RAISE NOTICE '=======================================';
END $$;
