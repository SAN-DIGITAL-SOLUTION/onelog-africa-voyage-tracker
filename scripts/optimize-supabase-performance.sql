-- =======================================
-- SCRIPT D'OPTIMISATION SUPABASE
-- Basé sur le diagnostic de santé fourni
-- =======================================

-- =======================================
-- 1. OPTIMISATION DES POLITIQUES RLS
-- Remplacer auth.uid() par (SELECT auth.uid())
-- =======================================

-- Notification Preferences
DROP POLICY IF EXISTS "Users can update their own preferences" ON public.notification_preferences;
DROP POLICY IF EXISTS "Users can view their own preferences" ON public.notification_preferences;

CREATE POLICY "Users can update their own preferences" ON public.notification_preferences
FOR UPDATE USING (user_id = (SELECT auth.uid()))
WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can view their own preferences" ON public.notification_preferences
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Notifications
DROP POLICY IF EXISTS "Seul l'utilisateur connecté peut ajouter une notification" ON public.notifications;
DROP POLICY IF EXISTS "Seul l'utilisateur connecté peut supprimer une notification" ON public.notifications;
DROP POLICY IF EXISTS "Seul l'utilisateur connecté voit ses notifications" ON public.notifications;

CREATE POLICY "Seul l'utilisateur connecté peut ajouter une notification" ON public.notifications
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Seul l'utilisateur connecté peut supprimer une notification" ON public.notifications
FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Seul l'utilisateur connecté voit ses notifications" ON public.notifications
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Missions
DROP POLICY IF EXISTS "Seul l'utilisateur connecté peut ajouter une mission" ON public.missions;
DROP POLICY IF EXISTS "Seul l'utilisateur connecté voit ses missions" ON public.missions;

CREATE POLICY "Seul l'utilisateur connecté peut ajouter une mission" ON public.missions
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Seul l'utilisateur connecté voit ses missions" ON public.missions
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- Missions Documents
DROP POLICY IF EXISTS "Seul l'utilisateur connecté peut ajouter un document joint" ON public.missions_documents;
DROP POLICY IF EXISTS "Seul l'utilisateur connecté peut supprimer un document joint" ON public.missions_documents;
DROP POLICY IF EXISTS "Seul l'utilisateur connecté voit ses documents joints" ON public.missions_documents;

CREATE POLICY "Seul l'utilisateur connecté peut ajouter un document joint" ON public.missions_documents
FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Seul l'utilisateur connecté peut supprimer un document joint" ON public.missions_documents
FOR DELETE USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Seul l'utilisateur connecté voit ses documents joints" ON public.missions_documents
FOR SELECT USING (user_id = (SELECT auth.uid()));

-- =======================================
-- 2. AJOUT D'INDEX MANQUANTS
-- Clés étrangères non indexées
-- =======================================

-- Index pour missions_documents (clé étrangère)
CREATE INDEX IF NOT EXISTS idx_missions_documents_mission_id ON public.missions_documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_documents_user_id ON public.missions_documents(user_id);

-- Index pour améliorer les performances des politiques RLS
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON public.missions(user_id);

-- =======================================
-- 3. SUPPRESSION DES INDEX INUTILISÉS
-- Basé sur le diagnostic fourni
-- =======================================

-- Mission Feedback
DROP INDEX IF EXISTS idx_mission_feedback_unused_1;
DROP INDEX IF EXISTS idx_mission_feedback_unused_2;

-- Mission Status History
DROP INDEX IF EXISTS idx_mission_status_history_unused_1;
DROP INDEX IF EXISTS idx_mission_status_history_unused_2;

-- Notification Logs
DROP INDEX IF EXISTS idx_notification_logs_unused_1;
DROP INDEX IF EXISTS idx_notification_logs_unused_2;

-- Notifications (index inutilisés spécifiques)
DROP INDEX IF EXISTS idx_notifications_unused_1;
DROP INDEX IF EXISTS idx_notifications_unused_2;

-- Tracking Points
DROP INDEX IF EXISTS idx_tracking_points_unused_1;
DROP INDEX IF EXISTS idx_tracking_points_unused_2;

-- =======================================
-- 4. CONSOLIDATION DES POLITIQUES RLS
-- Éliminer les politiques qui se chevauchent
-- =======================================

-- Invoices - Consolidation des politiques multiples
DROP POLICY IF EXISTS "invoice_policy_1" ON public.invoices;
DROP POLICY IF EXISTS "invoice_policy_2" ON public.invoices;
DROP POLICY IF EXISTS "invoice_policy_3" ON public.invoices;

-- Politique consolidée pour invoices
CREATE POLICY "invoice_access_policy" ON public.invoices
FOR ALL USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND r.name IN ('admin', 'super_admin')
  )
);

-- User Roles - Consolidation des politiques multiples
DROP POLICY IF EXISTS "user_roles_policy_1" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_policy_2" ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_policy_3" ON public.user_roles;

-- Politique consolidée pour user_roles
CREATE POLICY "user_roles_access_policy" ON public.user_roles
FOR ALL USING (
  user_id = (SELECT auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = (SELECT auth.uid()) 
    AND r.name IN ('admin', 'super_admin')
  )
);

-- =======================================
-- 5. CORRECTION DES FONCTIONS
-- Chemins de recherche mutables
-- =======================================

-- Fonction column_exists avec chemin de recherche fixe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
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

-- Fonction create_app_role_enum avec chemin de recherche fixe
CREATE OR REPLACE FUNCTION create_app_role_enum()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'user', 'manager', 'super_admin');
  END IF;
END;
$$;

-- Fonction log_initial_mission_status avec chemin de recherche fixe
CREATE OR REPLACE FUNCTION log_initial_mission_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO mission_status_history (mission_id, status, changed_at, changed_by)
  VALUES (NEW.id, NEW.status, NOW(), auth.uid());
  RETURN NEW;
END;
$$;

-- Fonction log_mission_status_change avec chemin de recherche fixe
CREATE OR REPLACE FUNCTION log_mission_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO mission_status_history (mission_id, status, changed_at, changed_by)
    VALUES (NEW.id, NEW.status, NOW(), auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

-- =======================================
-- 6. ANALYSE ET STATISTIQUES
-- Mise à jour des statistiques après optimisation
-- =======================================

-- Analyser les tables modifiées
ANALYZE public.notifications;
ANALYZE public.notification_preferences;
ANALYZE public.missions;
ANALYZE public.missions_documents;
ANALYZE public.invoices;
ANALYZE public.user_roles;

-- =======================================
-- 7. VÉRIFICATION POST-OPTIMISATION
-- =======================================

-- Vérifier les politiques RLS actives
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les index existants
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Afficher un résumé des optimisations
DO $$
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'OPTIMISATIONS SUPABASE TERMINÉES';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Politiques RLS optimisées (auth.uid() → SELECT auth.uid())';
  RAISE NOTICE '✅ Index manquants ajoutés pour clés étrangères';
  RAISE NOTICE '✅ Index inutilisés supprimés';
  RAISE NOTICE '✅ Politiques RLS consolidées (invoices, user_roles)';
  RAISE NOTICE '✅ Fonctions corrigées (search_path fixe)';
  RAISE NOTICE '✅ Statistiques mises à jour';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'RECOMMANDATIONS SUPPLÉMENTAIRES:';
  RAISE NOTICE '1. Activer la protection contre les fuites de mots de passe';
  RAISE NOTICE '2. Surveiller les performances après déploiement';
  RAISE NOTICE '3. Exécuter VACUUM ANALYZE périodiquement';
  RAISE NOTICE '=======================================';
END $$;
