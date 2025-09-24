-- Ajout de la colonne role à la table profiles pour la gestion des droits d'administration
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role TEXT;

-- Mise à jour du profil admin QA
UPDATE public.profiles SET role = 'admin' WHERE id = 'admin-uuid';
