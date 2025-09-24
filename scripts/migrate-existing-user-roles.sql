-- =======================================
-- MIGRATION ADAPTÉE - USER_ROLES EXISTANTE
-- Structure détectée: id, user_id, role, requested_role, role_status
-- =======================================

-- =======================================
-- 1. CRÉATION TABLE ROLES (MANQUANTE)
-- =======================================

CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des rôles de base
INSERT INTO public.roles (name, description) VALUES 
('super_admin', 'Super Administrateur - Accès complet à toutes les fonctionnalités'),
('admin', 'Administrateur - Gestion des utilisateurs et missions'),
('manager', 'Gestionnaire - Supervision des opérations'),
('exploiteur', 'Exploiteur - Gestion des missions et véhicules'),
('chauffeur', 'Chauffeur - Exécution des missions de transport'),
('client', 'Client - Demande et suivi des missions')
ON CONFLICT (name) DO NOTHING;

-- =======================================
-- 2. CRÉATION TABLE PERMISSIONS
-- =======================================

CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des permissions de base
INSERT INTO public.permissions (name, description) VALUES 
('manage_users', 'Gérer les utilisateurs'),
('manage_missions', 'Gérer les missions'),
('manage_vehicles', 'Gérer les véhicules'),
('view_analytics', 'Voir les analytics'),
('manage_billing', 'Gérer la facturation'),
('manage_notifications', 'Gérer les notifications'),
('manage_system_config', 'Gérer la configuration système')
ON CONFLICT (name) DO NOTHING;

-- =======================================
-- 3. ADAPTATION USER_ROLES EXISTANTE
-- =======================================

-- Ajouter colonne role_id pour référencer la table roles
DO $$
BEGIN
  -- Vérifier si la colonne role_id existe déjà
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'role_id'
  ) THEN
    -- Ajouter la colonne role_id
    ALTER TABLE public.user_roles 
    ADD COLUMN role_id INTEGER REFERENCES public.roles(id) ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Colonne role_id ajoutée à user_roles';
  END IF;
END $$;

-- Synchroniser les données existantes avec la nouvelle table roles
UPDATE public.user_roles 
SET role_id = r.id 
FROM public.roles r 
WHERE public.user_roles.role::text = r.name 
  AND public.user_roles.role_id IS NULL
  AND public.user_roles.role_status = 'approved';

-- =======================================
-- 4. ACTIVATION RLS SUR NOUVELLES TABLES
-- =======================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- Vérifier si RLS est déjà activé sur user_roles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS activé sur user_roles';
  END IF;
END $$;

-- =======================================
-- 5. POLITIQUES RLS ADAPTÉES
-- =======================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Super admin can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;
DROP POLICY IF EXISTS "Users can view own user_roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage user_roles" ON public.user_roles;

-- Politiques pour la table roles
CREATE POLICY "Super admin can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text = 'super_admin' 
    AND ur.role_status = 'approved'
  )
);

CREATE POLICY "Authenticated users can view roles" ON public.roles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- Politiques pour user_roles (adaptées à la structure existante)
CREATE POLICY "Users can view own user_roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Super admin can manage all user_roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text = 'super_admin' 
    AND ur.role_status = 'approved'
  )
);

CREATE POLICY "Admin can manage user_roles" ON public.user_roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text IN ('admin', 'super_admin') 
    AND ur.role_status = 'approved'
  )
);

-- =======================================
-- 6. INDEX POUR PERFORMANCES
-- =======================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON public.permissions(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_status ON public.user_roles(role_status);

-- =======================================
-- 7. FONCTION HELPER ADAPTÉE
-- =======================================

CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid 
    AND ur.role = role_name 
    AND ur.role_status = 'approved'
  );
END;
$$;

-- =======================================
-- 8. ASSIGNATION SUPER ADMIN
-- =======================================

-- Assigner le rôle super_admin à san@sandigitalsolutions.com
DO $$
DECLARE
  user_uuid UUID;
  super_admin_role_id INTEGER;
BEGIN
  -- Récupérer l'UUID de l'utilisateur
  SELECT id INTO user_uuid 
  FROM auth.users 
  WHERE email = 'san@sandigitalsolutions.com';
  
  -- Récupérer l'ID du rôle super_admin
  SELECT id INTO super_admin_role_id 
  FROM public.roles 
  WHERE name = 'super_admin';
  
  IF user_uuid IS NOT NULL THEN
    -- Vérifier si l'utilisateur a déjà un rôle
    IF NOT EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = user_uuid AND role_status = 'approved'
    ) THEN
      -- Insérer le rôle super_admin
      INSERT INTO public.user_roles (user_id, role, role_id, role_status)
      VALUES (user_uuid, 'super_admin', super_admin_role_id, 'approved');
      
      RAISE NOTICE '✅ Rôle super_admin assigné à san@sandigitalsolutions.com';
    ELSE
      -- Mettre à jour le rôle existant vers super_admin
      UPDATE public.user_roles 
      SET role = 'super_admin', role_id = super_admin_role_id
      WHERE user_id = user_uuid AND role_status = 'approved';
      
      RAISE NOTICE '✅ Rôle mis à jour vers super_admin pour san@sandigitalsolutions.com';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Utilisateur san@sandigitalsolutions.com non trouvé';
    RAISE NOTICE '💡 L''utilisateur doit d''abord s''inscrire via l''interface web';
  END IF;
END $$;

-- =======================================
-- 9. VÉRIFICATION ET RÉSUMÉ
-- =======================================

DO $$
DECLARE
  roles_count INTEGER;
  permissions_count INTEGER;
  user_roles_count INTEGER;
  approved_roles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM public.roles;
  SELECT COUNT(*) INTO permissions_count FROM public.permissions;
  SELECT COUNT(*) INTO user_roles_count FROM public.user_roles;
  SELECT COUNT(*) INTO approved_roles_count FROM public.user_roles WHERE role_status = 'approved';
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'MIGRATION ADAPTÉE TERMINÉE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Table roles créée: % rôles', roles_count;
  RAISE NOTICE '✅ Table permissions créée: % permissions', permissions_count;
  RAISE NOTICE '✅ User_roles existante adaptée: % total, % approuvés', user_roles_count, approved_roles_count;
  RAISE NOTICE '✅ Colonne role_id ajoutée et synchronisée';
  RAISE NOTICE '✅ RLS activé et politiques adaptées';
  RAISE NOTICE '✅ Index de performance ajoutés';
  RAISE NOTICE '✅ Fonction helper user_has_role() créée';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'STRUCTURE COMPATIBLE - PRÊT POUR OPTIMISATIONS';
  RAISE NOTICE '=======================================';
END $$;
