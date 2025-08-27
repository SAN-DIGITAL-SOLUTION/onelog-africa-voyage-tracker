-- =======================================
-- VÉRIFICATION RAPIDE DES TABLES
-- Suite à auth_users_exists = true
-- =======================================

-- 1. Lister toutes les tables publiques existantes
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 2. Vérifier spécifiquement les tables critiques
SELECT 
  'roles' as table_name,
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'roles') as exists
UNION ALL
SELECT 
  'permissions',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'permissions')
UNION ALL
SELECT 
  'user_roles',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_roles')
UNION ALL
SELECT 
  'profiles',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles')
UNION ALL
SELECT 
  'missions',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'missions')
UNION ALL
SELECT 
  'notifications',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notifications')
UNION ALL
SELECT 
  'notification_preferences',
  EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_preferences');

-- 3. Compter les utilisateurs auth
SELECT COUNT(*) as total_users FROM auth.users;

-- 4. Résumé rapide
DO $$
DECLARE
  table_count INTEGER;
  auth_users_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO auth_users_count FROM auth.users;
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'DIAGNOSTIC RAPIDE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Table auth.users: EXISTE (%s utilisateurs)', auth_users_count;
  RAISE NOTICE '📊 Tables publiques: %s', table_count;
  
  IF table_count = 0 THEN
    RAISE NOTICE '⚠️  AUCUNE TABLE PUBLIQUE - Schéma de base requis';
  ELSIF table_count < 7 THEN
    RAISE NOTICE '⚠️  TABLES MANQUANTES - Migration partielle requise';
  ELSE
    RAISE NOTICE '✅ Base existante - Optimisations possibles';
  END IF;
  
  RAISE NOTICE '=======================================';
END $$;
