-- =======================================
-- CRÉATION DES FONCTIONS RPC MANQUANTES
-- Résout les erreurs ERR_NAME_NOT_RESOLVED
-- =======================================

-- =======================================
-- 1. FONCTION table_exists
-- =======================================

CREATE OR REPLACE FUNCTION public.table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = $1
  );
END;
$$;

-- =======================================
-- 2. FONCTION column_exists
-- =======================================

CREATE OR REPLACE FUNCTION public.column_exists(table_name TEXT, column_name TEXT)
RETURNS BOOLEAN
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

-- =======================================
-- 3. FONCTION create_app_role_enum
-- =======================================

CREATE OR REPLACE FUNCTION public.create_app_role_enum()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier si l'enum existe déjà
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    RETURN 'Enum app_role existe déjà';
  END IF;
  
  -- Créer l'enum
  CREATE TYPE app_role AS ENUM ('admin', 'exploiteur', 'chauffeur', 'client', 'super_admin');
  
  RETURN 'Enum app_role créé avec succès';
EXCEPTION
  WHEN duplicate_object THEN
    RETURN 'Enum app_role existe déjà';
  WHEN OTHERS THEN
    RETURN 'Erreur lors de la création: ' || SQLERRM;
END;
$$;

-- =======================================
-- 4. FONCTION create_user_roles_table
-- =======================================

CREATE OR REPLACE FUNCTION public.create_user_roles_table()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Vérifier si la table existe déjà
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    RETURN 'Table user_roles existe déjà';
  END IF;
  
  -- Créer la table user_roles
  CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role app_role NOT NULL DEFAULT 'client',
    requested_role app_role,
    role_status TEXT DEFAULT 'approved' CHECK (role_status IN ('pending', 'approved', 'rejected')),
    role_id INTEGER REFERENCES public.roles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role)
  );
  
  -- Activer RLS
  ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
  
  -- Créer les index
  CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
  CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
  CREATE INDEX IF NOT EXISTS idx_user_roles_status ON public.user_roles(role_status);
  
  RETURN 'Table user_roles créée avec succès';
EXCEPTION
  WHEN duplicate_table THEN
    RETURN 'Table user_roles existe déjà';
  WHEN OTHERS THEN
    RETURN 'Erreur lors de la création: ' || SQLERRM;
END;
$$;

-- =======================================
-- 5. FONCTION get_user_role
-- =======================================

CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Vérifier d'abord par role_id (priorité)
  SELECT r.name INTO user_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = user_uuid 
  AND ur.role_status = 'approved'
  LIMIT 1;
  
  -- Si pas trouvé, utiliser l'enum role
  IF user_role IS NULL THEN
    SELECT ur.role::text INTO user_role
    FROM public.user_roles ur
    WHERE ur.user_id = user_uuid 
    AND ur.role_status = 'approved'
    LIMIT 1;
  END IF;
  
  RETURN COALESCE(user_role, 'client');
END;
$$;

-- =======================================
-- 6. FONCTION assign_user_role
-- =======================================

CREATE OR REPLACE FUNCTION public.assign_user_role(user_uuid UUID, role_name TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  role_id_val INTEGER;
BEGIN
  -- Trouver l'ID du rôle
  SELECT id INTO role_id_val 
  FROM public.roles 
  WHERE name = role_name;
  
  IF role_id_val IS NULL THEN
    RETURN 'Rôle non trouvé: ' || role_name;
  END IF;
  
  -- Insérer ou mettre à jour
  INSERT INTO public.user_roles (user_id, role, role_id, role_status)
  VALUES (user_uuid, role_name::app_role, role_id_val, 'approved')
  ON CONFLICT (user_id, role) DO UPDATE SET
    role_id = role_id_val,
    role_status = 'approved',
    updated_at = NOW();
    
  RETURN 'Rôle assigné avec succès: ' || role_name;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Erreur lors de l''assignation: ' || SQLERRM;
END;
$$;

-- =======================================
-- 7. PERMISSIONS POUR LES FONCTIONS RPC
-- =======================================

-- Permettre l'exécution des fonctions RPC aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.table_exists(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.column_exists(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_app_role_enum() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_user_roles_table() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_user_role(UUID, TEXT) TO authenticated;

-- =======================================
-- 8. VÉRIFICATION FINALE
-- =======================================

DO $$
DECLARE
  func_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO func_count 
  FROM information_schema.routines 
  WHERE routine_schema = 'public' 
  AND routine_name IN ('table_exists', 'column_exists', 'create_app_role_enum', 'create_user_roles_table', 'get_user_role', 'assign_user_role');
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'FONCTIONS RPC CRÉÉES';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Fonctions RPC créées: %', func_count;
  RAISE NOTICE '✅ Permissions accordées aux utilisateurs authentifiés';
  RAISE NOTICE '✅ Les erreurs ERR_NAME_NOT_RESOLVED devraient être résolues';
  RAISE NOTICE '=======================================';
END $$;
