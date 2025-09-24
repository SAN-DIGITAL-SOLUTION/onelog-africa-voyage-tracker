-- =======================================
-- CORRECTION ENUM APP_ROLE - SOLUTION DÉFINITIVE
-- Problème: enum app_role ne contient pas 'super_admin'
-- =======================================

-- =======================================
-- 1. DIAGNOSTIC DE L'ENUM EXISTANTE
-- =======================================

DO $$
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'DIAGNOSTIC ENUM APP_ROLE';
  RAISE NOTICE '=======================================';
  
  -- Vérifier si l'enum app_role existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    RAISE NOTICE '✅ Enum app_role trouvée';
    RAISE NOTICE 'Valeurs actuelles: %', 
      (SELECT string_agg(e.enumlabel, ', ') 
       FROM pg_enum e 
       JOIN pg_type t ON e.enumtypid = t.oid 
       WHERE t.typname = 'app_role');
  ELSE
    RAISE NOTICE '⚠️ Enum app_role non trouvée';
  END IF;
END $$;

-- =======================================
-- 2. CRÉATION TABLE ROLES (SI MANQUANTE)
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
-- 3. AJOUT DE SUPER_ADMIN À L'ENUM
-- =======================================

-- D'abord, vérifier les valeurs existantes
DO $$
BEGIN
  RAISE NOTICE 'Valeurs enum existantes: %', 
    (SELECT string_agg(e.enumlabel, ', ') 
     FROM pg_enum e 
     JOIN pg_type t ON e.enumtypid = t.oid 
     WHERE t.typname = 'app_role');
END $$;

-- Ajouter super_admin HORS transaction (requis par PostgreSQL)
DO $$
BEGIN
  -- Vérifier si super_admin existe déjà dans l'enum
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'app_role' AND e.enumlabel = 'super_admin'
  ) THEN
    -- Utiliser EXECUTE pour éviter les problèmes de transaction
    EXECUTE 'ALTER TYPE app_role ADD VALUE ''super_admin''';
    RAISE NOTICE '✅ super_admin ajouté à l''enum app_role';
  ELSE
    RAISE NOTICE '✅ super_admin existe déjà dans l''enum';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Erreur lors de l''ajout à l''enum: %', SQLERRM;
END $$;

-- =======================================
-- 4. AJOUT COLONNE ROLE_ID
-- =======================================

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
  ELSE
    RAISE NOTICE '✅ Colonne role_id existe déjà';
  END IF;
END $$;

-- =======================================
-- 5. SYNCHRONISATION DES DONNÉES
-- =======================================

-- Synchroniser les rôles existants avec role_id
UPDATE public.user_roles 
SET role_id = r.id 
FROM public.roles r 
WHERE public.user_roles.role::text = r.name 
  AND public.user_roles.role_id IS NULL
  AND public.user_roles.role_status = 'approved';

-- =======================================
-- 6. ASSIGNATION SUPER ADMIN SÉCURISÉE
-- =======================================

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
    -- Vérifier si l'utilisateur a déjà un rôle
    IF EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = user_uuid AND role_status = 'approved'
    ) THEN
      -- Mettre à jour le rôle existant vers super_admin
      UPDATE public.user_roles 
      SET role = 'super_admin'::app_role, role_id = super_admin_role_id
      WHERE user_id = user_uuid AND role_status = 'approved';
      
      RAISE NOTICE '✅ Rôle mis à jour vers super_admin pour san@sandigitalsolutions.com';
    ELSE
      -- Insérer un nouveau rôle super_admin
      INSERT INTO public.user_roles (user_id, role, role_id, role_status)
      VALUES (user_uuid, 'super_admin'::app_role, super_admin_role_id, 'approved');
      
      RAISE NOTICE '✅ Rôle super_admin assigné à san@sandigitalsolutions.com';
    END IF;
  ELSE
    IF user_uuid IS NULL THEN
      RAISE NOTICE '⚠️ Utilisateur san@sandigitalsolutions.com non trouvé';
      RAISE NOTICE '💡 L''utilisateur doit d''abord s''inscrire via l''interface web';
    END IF;
    
    IF super_admin_role_id IS NULL THEN
      RAISE NOTICE '⚠️ Rôle super_admin non trouvé dans la table roles';
    END IF;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ Erreur lors de l''assignation super admin: %', SQLERRM;
END $$;

-- =======================================
-- 7. ACTIVATION RLS ET POLITIQUES
-- =======================================

ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Super admin can manage roles" ON public.roles;
DROP POLICY IF EXISTS "Authenticated users can view roles" ON public.roles;

-- Politiques pour la table roles
CREATE POLICY "Super admin can manage roles" ON public.roles
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'super_admin'::app_role
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

-- =======================================
-- 9. FONCTION HELPER MISE À JOUR
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
    AND ur.role::text = role_name 
    AND ur.role_status = 'approved'
  );
END;
$$;

-- =======================================
-- 10. VÉRIFICATION FINALE
-- =======================================

DO $$
DECLARE
  roles_count INTEGER;
  user_roles_count INTEGER;
  super_admin_count INTEGER;
  enum_values TEXT;
BEGIN
  SELECT COUNT(*) INTO roles_count FROM public.roles;
  SELECT COUNT(*) INTO user_roles_count FROM public.user_roles WHERE role_status = 'approved';
  SELECT COUNT(*) INTO super_admin_count FROM public.user_roles WHERE role::text = 'super_admin' AND role_status = 'approved';
  
  -- Récupérer les valeurs de l'enum
  SELECT string_agg(e.enumlabel, ', ') INTO enum_values
  FROM pg_enum e 
  JOIN pg_type t ON e.enumtypid = t.oid 
  WHERE t.typname = 'app_role';
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'CORRECTION ENUM TERMINÉE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Table roles: % rôles', roles_count;
  RAISE NOTICE '✅ User_roles approuvés: %', user_roles_count;
  RAISE NOTICE '✅ Super admins: %', super_admin_count;
  RAISE NOTICE '✅ Enum app_role valeurs: %', enum_values;
  RAISE NOTICE '✅ Colonne role_id synchronisée';
  RAISE NOTICE '✅ RLS et politiques activées';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'SYSTÈME PRÊT - ENUM CORRIGÉE';
  RAISE NOTICE '=======================================';
END $$;
