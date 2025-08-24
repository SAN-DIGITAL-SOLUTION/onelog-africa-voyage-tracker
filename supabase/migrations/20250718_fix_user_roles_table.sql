-- Script de correction de la table user_roles
-- Créé le 18/07/2024

-- Étape 1 : Créer le type enum app_role s'il n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'exploiteur', 'chauffeur', 'client');
  END IF;
END $$;

-- Étape 2 : Vérifier si la table user_roles existe déjà
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    -- La table existe, vérifier sa structure
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'requested_role') THEN
      -- Ajouter les colonnes manquantes
      ALTER TABLE public.user_roles 
        ADD COLUMN requested_role app_role NULL,
        ADD COLUMN role_status TEXT NOT NULL DEFAULT 'approved';
      
      -- Mettre à jour les enregistrements existants
      UPDATE public.user_roles SET role_status = 'approved' WHERE role_status IS NULL;
      
      RAISE NOTICE 'Colonnes ajoutées à la table user_roles';
    ELSE
      RAISE NOTICE 'La table user_roles a déjà la structure attendue';
    END IF;
  ELSE
    -- Créer la table avec la structure attendue
    CREATE TABLE public.user_roles (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role app_role NOT NULL,
      requested_role app_role NULL,
      role_status TEXT NOT NULL DEFAULT 'approved',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );
    
    -- Créer un index sur le champ role pour les recherches fréquentes
    CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
    
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
    
    -- 4. Les administrateurs peuvent approuver/refuser les demandes de rôle
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
    
    RAISE NOTICE 'Table user_roles créée avec succès';
  END IF;
END $$;
