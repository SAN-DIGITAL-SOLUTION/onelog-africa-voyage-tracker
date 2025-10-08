-- Création du type enum app_role s'il n'existe pas déjà
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE app_role AS ENUM ('admin', 'exploiteur', 'chauffeur', 'client');
    RAISE NOTICE 'Type app_role créé avec succès';
  ELSE
    RAISE NOTICE 'Le type app_role existe déjà';
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erreur lors de la création du type app_role: %', SQLERRM;
END $$;

-- Création de la table user_roles si elle n'existe pas
DO $$
BEGIN
  -- Vérifier si la table existe déjà
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles') THEN
    -- Créer la table avec la structure attendue
    CREATE TABLE public.user_roles (
      user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      role app_role NOT NULL,
      requested_role app_role,
      role_status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Créer un index sur le champ role pour les performances
    CREATE INDEX idx_user_roles_role ON public.user_roles(role);
    
    -- Activer RLS (Row Level Security) sur la table
    ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
    
    -- Ajouter des politiques RLS pour la sécurité
    -- Les utilisateurs peuvent voir leur propre rôle
    CREATE POLICY "Les utilisateurs peuvent voir leur propre rôle"
      ON public.user_roles
      FOR SELECT
      USING (auth.uid() = user_id);
      
    -- Les administrateurs peuvent voir tous les rôles
    CREATE POLICY "Les administrateurs peuvent voir tous les rôles"
      ON public.user_roles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
      );
      
    -- Les utilisateurs peuvent mettre à jour leur propre demande de rôle
    CREATE POLICY "Les utilisateurs peuvent mettre à jour leur propre demande de rôle"
      ON public.user_roles
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
      
    -- Les administrateurs peuvent mettre à jour n'importe quel rôle
    CREATE POLICY "Les administrateurs peuvent mettre à jour n'importe quel rôle"
      ON public.user_roles
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM auth.users
          WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin'
        )
      );
    
    RAISE NOTICE 'Table user_roles créée avec succès';
  ELSE
    RAISE NOTICE 'La table user_roles existe déjà';
    
    -- Vérifier et ajouter les colonnes manquantes si nécessaire
    -- Colonne requested_role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'requested_role') THEN
      ALTER TABLE public.user_roles ADD COLUMN requested_role app_role;
      RAISE NOTICE 'Colonne requested_role ajoutée à la table user_roles';
    END IF;
    
    -- Colonne role_status
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role_status') THEN
      ALTER TABLE public.user_roles ADD COLUMN role_status TEXT NOT NULL DEFAULT 'pending';
      RAISE NOTICE 'Colonne role_status ajoutée à la table user_roles';
    END IF;
    
    -- Colonnes de timestamp si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'created_at') THEN
      ALTER TABLE public.user_roles ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      RAISE NOTICE 'Colonne created_at ajoutée à la table user_roles';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'updated_at') THEN
      ALTER TABLE public.user_roles ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      
      -- Créer une fonction pour mettre à jour automatiquement updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
      
      -- Créer un déclencheur pour appeler la fonction à chaque mise à jour
      CREATE TRIGGER update_user_roles_updated_at
      BEFORE UPDATE ON public.user_roles
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
      
      RAISE NOTICE 'Colonne updated_at ajoutée à la table user_roles avec un déclencheur de mise à jour';
    END IF;
  END IF;
  
  -- Vérifier et ajouter des index si nécessaire
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE schemaname = 'public' 
    AND tablename = 'user_roles' 
    AND indexname = 'idx_user_roles_role'
  ) THEN
    CREATE INDEX idx_user_roles_role ON public.user_roles(role);
    RAISE NOTICE 'Index sur la colonne role créé avec succès';
  END IF;
  
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Erreur lors de la création de la table user_roles: %', SQLERRM;
END $$;

-- Ajouter un commentaire sur la table pour la documentation
COMMENT ON TABLE public.user_roles IS 'Table de liaison entre les utilisateurs et leurs rôles dans l''application';

-- Ajouter des commentaires sur les colonnes
COMMENT ON COLUMN public.user_roles.user_id IS 'ID de l''utilisateur (clé étrangère vers auth.users)';
COMMENT ON COLUMN public.user_roles.role IS 'Rôle actuel de l''utilisateur';
COMMENT ON COLUMN public.user_roles.requested_role IS 'Rôle demandé par l''utilisateur (en attente de validation)';
COMMENT ON COLUMN public.user_roles.role_status IS 'Statut de la demande de rôle (pending, approved, rejected)';
COMMENT ON COLUMN public.user_roles.created_at IS 'Date de création de l''enregistrement';
COMMENT ON COLUMN public.user_roles.updated_at IS 'Date de dernière mise à jour de l''enregistrement';
