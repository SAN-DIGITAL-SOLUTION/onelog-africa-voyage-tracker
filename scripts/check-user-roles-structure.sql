-- =======================================
-- VÉRIFICATION STRUCTURE USER_ROLES
-- Diagnostic de la colonne manquante
-- =======================================

-- Vérifier la structure actuelle de user_roles
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- Vérifier les contraintes existantes
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'user_roles';

-- Compter les lignes existantes
SELECT COUNT(*) as total_rows FROM public.user_roles;

-- Afficher quelques lignes pour comprendre la structure
SELECT * FROM public.user_roles LIMIT 5;
