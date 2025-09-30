-- =======================================
-- MIGRATION CIBLÉE - TABLES MANQUANTES
-- Basé sur l'audit: roles = false
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
-- 2. CRÉATION TABLE PERMISSIONS (PROBABLE)
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
-- 3. VÉRIFICATION USER_ROLES EXISTANTE
-- =======================================

-- D'abord vérifier la structure de user_roles
DO $$
DECLARE
  has_role_id BOOLEAN;
BEGIN
  -- Vérifier si la colonne role_id existe
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'role_id'
  ) INTO has_role_id;
  
  IF NOT has_role_id THEN
    -- Ajouter la colonne role_id si elle n'existe pas
    ALTER TABLE public.user_roles 
    ADD COLUMN role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Colonne role_id ajoutée à user_roles';
  END IF;
  
  -- Ajouter contrainte unique si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'user_roles' 
    AND constraint_type = 'UNIQUE'
    AND constraint_name LIKE '%user_id%role_id%'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD CONSTRAINT user_roles_user_id_role_id_unique 
    UNIQUE(user_id, role_id);
    
    RAISE NOTICE '✅ Contrainte unique user_id/role_id ajoutée';
  END IF;
END $$;

-- =======================================
-- 4. ACTIVATION RLS SUR NOUVELLES TABLES
-- =======================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- =======================================
-- 5. POLITIQUES RLS POUR ROLES
-- =======================================

-- Super admin peut tout voir et modifier
CREATE POLICY "Super admin can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

-- Tous les utilisateurs authentifiés peuvent voir les rôles
CREATE POLICY "Authenticated users can view roles" ON public.roles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- =======================================
-- 6. POLITIQUES RLS POUR PERMISSIONS
-- =======================================

-- Super admin peut tout voir et modifier
CREATE POLICY "Super admin can manage permissions" ON public.permissions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

-- Utilisateurs authentifiés peuvent voir les permissions
CREATE POLICY "Authenticated users can view permissions" ON public.permissions
FOR SELECT USING (auth.uid() IS NOT NULL);

-- =======================================
-- 7. INDEX POUR PERFORMANCES
-- =======================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_permissions_name ON public.permissions(name);

-- Vérifier si les index user_roles existent déjà
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);

-- =======================================
-- 8. FONCTION HELPER POUR VÉRIFIER RÔLES
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
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid AND r.name = role_name
  );
END;
$$;

-- =======================================
-- 9. CRÉATION COMPTE SUPER ADMIN
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
  
  IF user_uuid IS NOT NULL AND super_admin_role_id IS NOT NULL THEN
    -- Insérer l'assignation du rôle
    INSERT INTO public.user_roles (user_id, role_id, assigned_at)
    VALUES (user_uuid, super_admin_role_id, NOW())
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RAISE NOTICE '✅ Rôle super_admin assigné à san@sandigitalsolutions.com';
  ELSE
    IF user_uuid IS NULL THEN
      RAISE NOTICE '⚠️ Utilisateur san@sandigitalsolutions.com non trouvé';
      RAISE NOTICE '💡 L''utilisateur doit d''abord s''inscrire via l''interface web';
    END IF;
    
    IF super_admin_role_id IS NULL THEN
      RAISE NOTICE '⚠️ Rôle super_admin non trouvé';
    END IF;
  END IF;
END $$;

-- =======================================
-- 10. VÉRIFICATION ET RÉSUMÉ
-- =======================================

DO $$
DECLARE
  roles_count INTEGER;
  permissions_count INTEGER;
  user_roles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM public.roles;
  SELECT COUNT(*) INTO permissions_count FROM public.permissions;
  SELECT COUNT(*) INTO user_roles_count FROM public.user_roles;
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'MIGRATION CIBLÉE TERMINÉE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Table roles créée: % rôles', roles_count;
  RAISE NOTICE '✅ Table permissions créée: % permissions', permissions_count;
  RAISE NOTICE '✅ Assignations user_roles: %', user_roles_count;
  RAISE NOTICE '✅ RLS activé sur nouvelles tables';
  RAISE NOTICE '✅ Politiques de sécurité appliquées';
  RAISE NOTICE '✅ Index de performance ajoutés';
  RAISE NOTICE '✅ Fonction helper user_has_role() créée';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'PRÊT POUR LES OPTIMISATIONS DE SÉCURITÉ';
  RAISE NOTICE '=======================================';
END $$;
