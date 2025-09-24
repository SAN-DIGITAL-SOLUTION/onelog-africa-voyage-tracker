-- Migration: Ajout des colonnes pour attribution flexible des rôles
ALTER TABLE public.user_roles
  ADD COLUMN IF NOT EXISTS requested_role app_role NULL,
  ADD COLUMN IF NOT EXISTS role_status TEXT NOT NULL DEFAULT 'approved';

-- Mise à jour des enregistrements existants
UPDATE public.user_roles SET role_status = 'approved' WHERE role_status IS NULL;
