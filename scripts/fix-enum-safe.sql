-- =======================================
-- CORRECTION ENUM APP_ROLE - VERSION SÉCURISÉE
-- Solution pour erreur PostgreSQL 55P04
-- =======================================

-- =======================================
-- 1. DIAGNOSTIC COMPLET
-- =======================================

-- Vérifier l'existence de l'enum
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') 
    THEN '✅ Enum app_role existe'
    ELSE '❌ Enum app_role manquante'
  END as status_enum;

-- Lister les valeurs actuelles
SELECT 
  '📋 Valeurs actuelles: ' || string_agg(e.enumlabel, ', ') as valeurs_enum
FROM pg_enum e 
JOIN pg_type t ON e.enumtypid = t.oid 
WHERE t.typname = 'app_role';

-- =======================================
-- 2. CRÉATION TABLE ROLES (SÉCURISÉE)
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
-- 3. AJOUT COLONNE ROLE_ID (SÉCURISÉ)
-- =======================================

DO $$
BEGIN
  -- Ajouter role_id si elle n'existe pas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'user_roles' 
    AND column_name = 'role_id'
  ) THEN
    ALTER TABLE public.user_roles 
    ADD COLUMN role_id INTEGER REFERENCES public.roles(id) ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Colonne role_id ajoutée';
  ELSE
    RAISE NOTICE '✅ Colonne role_id existe déjà';
  END IF;
END $$;

-- =======================================
-- 4. SYNCHRONISATION DONNÉES EXISTANTES
-- =======================================

-- Synchroniser les rôles existants avec role_id
UPDATE public.user_roles 
SET role_id = r.id 
FROM public.roles r 
WHERE public.user_roles.role::text = r.name 
  AND public.user_roles.role_id IS NULL
  AND public.user_roles.role_status = 'approved';

-- =======================================
-- 5. ASSIGNATION SUPER ADMIN DIRECTE
-- =======================================

DO $$
DECLARE
  user_uuid UUID;
  super_admin_role_id INTEGER;
  current_role_text TEXT;
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
    -- Vérifier le rôle actuel
    SELECT role::text INTO current_role_text
    FROM public.user_roles 
    WHERE user_id = user_uuid AND role_status = 'approved'
    LIMIT 1;
    
    IF current_role_text IS NOT NULL THEN
      -- Mettre à jour vers role_id uniquement (éviter l'enum)
      UPDATE public.user_roles 
      SET role_id = super_admin_role_id
      WHERE user_id = user_uuid AND role_status = 'approved';
      
      RAISE NOTICE '✅ Role_id mis à jour vers super_admin pour san@sandigitalsolutions.com';
      RAISE NOTICE '📋 Ancien rôle: % → Nouveau role_id: %', current_role_text, super_admin_role_id;
    ELSE
      -- Insérer avec admin (valeur enum sûre) + role_id super_admin
      INSERT INTO public.user_roles (user_id, role, role_id, role_status)
      VALUES (user_uuid, 'admin'::app_role, super_admin_role_id, 'approved');
      
      RAISE NOTICE '✅ Super admin créé avec role_id pour san@sandigitalsolutions.com';
    END IF;
  ELSE
    IF user_uuid IS NULL THEN
      RAISE NOTICE '⚠️ Utilisateur san@sandigitalsolutions.com non trouvé';
    END IF;
    IF super_admin_role_id IS NULL THEN
      RAISE NOTICE '⚠️ Rôle super_admin non trouvé dans la table roles';
    END IF;
  END IF;
END $$;

-- =======================================
-- 6. FONCTION HELPER MISE À JOUR
-- =======================================

CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier d'abord par role_id (priorité)
  IF EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = user_uuid 
    AND r.name = role_name 
    AND ur.role_status = 'approved'
  ) THEN
    RETURN TRUE;
  END IF;
  
  -- Fallback sur enum role
  RETURN EXISTS (
    SELECT 1 
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid 
    AND ur.role::text = role_name 
    AND ur.role_status = 'approved'
  );
END;
$$;

-- =======================================
-- 7. RLS ET POLITIQUES (COMPATIBLES)
-- =======================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Super admin can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;

-- Politiques compatibles avec role_id ET enum
CREATE POLICY "Super admin can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'super_admin'
    AND ur.role_status = 'approved'
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role::text = 'super_admin'
    AND ur.role_status = 'approved'
  )
);

CREATE POLICY "Authenticated users can view roles" ON public.roles
FOR SELECT USING (auth.uid() IS NOT NULL);

-- =======================================
-- 8. INDEX POUR PERFORMANCES
-- =======================================

CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles(name);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_status ON public.user_roles(role_status);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_status ON public.user_roles(user_id, role_status);

-- =======================================
-- 9. VÉRIFICATION FINALE
-- =======================================

DO $$
DECLARE
  roles_count INTEGER;
  user_roles_count INTEGER;
  super_admin_count INTEGER;
  super_admin_role_id_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM public.roles;
  SELECT COUNT(*) INTO user_roles_count FROM public.user_roles WHERE role_status = 'approved';
  
  -- Compter super_admin par enum
  SELECT COUNT(*) INTO super_admin_count 
  FROM public.user_roles 
  WHERE role::text = 'super_admin' AND role_status = 'approved';
  
  -- Compter super_admin par role_id
  SELECT COUNT(*) INTO super_admin_role_id_count 
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE r.name = 'super_admin' AND ur.role_status = 'approved';
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'CORRECTION SÉCURISÉE TERMINÉE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Table roles: % rôles', roles_count;
  RAISE NOTICE '✅ User_roles approuvés: %', user_roles_count;
  RAISE NOTICE '✅ Super admins (enum): %', super_admin_count;
  RAISE NOTICE '✅ Super admins (role_id): %', super_admin_role_id_count;
  RAISE NOTICE '✅ Colonne role_id synchronisée';
  RAISE NOTICE '✅ RLS et politiques activées';
  RAISE NOTICE '✅ Fonction helper mise à jour';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'SOLUTION: Utilise role_id au lieu d''enum';
  RAISE NOTICE 'ÉVITE: Erreur PostgreSQL 55P04';
  RAISE NOTICE '=======================================';
END $$;
