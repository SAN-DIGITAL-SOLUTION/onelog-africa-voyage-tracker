-- Fonction utilitaire pour vérifier si une table existe
CREATE OR REPLACE FUNCTION table_exists(table_name text)
RETURNS boolean AS $$
DECLARE
  result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = table_exists.table_name
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction utilitaire pour vérifier si une colonne existe dans une table
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
DECLARE
  result boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = column_exists.table_name
    AND column_name = column_exists.column_name
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer le type enum app_role
CREATE OR REPLACE FUNCTION create_app_role_enum()
RETURNS void AS $$
BEGIN
  -- Vérifier si le type existe déjà
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    EXECUTE 'CREATE TYPE app_role AS ENUM (''admin'', ''exploiteur'', ''chauffeur'', ''client'')';
  END IF;
  
  RETURN;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erreur lors de la création du type app_role: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer la table user_roles
CREATE OR REPLACE FUNCTION create_user_roles_table()
RETURNS void AS $$
BEGIN
  -- Vérifier si la table existe déjà
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    -- Créer la table user_roles
    CREATE TABLE public.user_roles (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role app_role NOT NULL,
      requested_role app_role NULL,
      role_status TEXT NOT NULL DEFAULT 'approved',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now(),
      CONSTRAINT valid_role_status CHECK (role_status IN ('pending', 'approved', 'rejected'))
    );
    
    -- Créer un index sur le champ role pour les recherches fréquentes
    CREATE INDEX idx_user_roles_role ON public.user_roles(role);
    
    -- Activer RLS
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Créer les politiques RLS
    -- 1. Les utilisateurs peuvent voir leur propre rôle
    CREATE POLICY "Users can view their own role" 
      ON public.user_roles 
      FOR SELECT 
      USING (auth.uid() = user_id);
    
    -- 2. Les utilisateurs peuvent demander un rôle (mode hybride)
    CREATE POLICY "Users can request a role" 
      ON public.user_roles 
      FOR INSERT 
      WITH CHECK (
        auth.uid() = user_id AND 
        (requested_role IS NOT NULL AND role IS NULL)
      );
    
    -- 3. Les utilisateurs peuvent mettre à jour leur demande de rôle (mode hybride)
    CREATE POLICY "Users can update their role request" 
      ON public.user_roles 
      FOR UPDATE 
      USING (
        auth.uid() = user_id AND 
        role_status = 'pending' AND 
        role IS NULL
      );
    
    -- 4. Les administrateurs peuvent gérer les demandes de rôle
    CREATE POLICY "Admins can manage role requests" 
      ON public.user_roles 
      FOR ALL 
      USING (
        EXISTS (
          SELECT 1 FROM public.user_roles 
          WHERE user_id = auth.uid() 
          AND role = 'admin'
        )
      );
  END IF;
  
  RETURN;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erreur lors de la création de la table user_roles: %', SQLERRM;
  RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
