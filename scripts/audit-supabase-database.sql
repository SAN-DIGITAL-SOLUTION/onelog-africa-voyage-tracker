-- =======================================
-- AUDIT COMPLET DE LA BASE SUPABASE
-- Diagnostic des éléments existants
-- =======================================

-- =======================================
-- 1. AUDIT DES TABLES EXISTANTES
-- =======================================

DO $$
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'AUDIT SUPABASE - TABLES EXISTANTES';
  RAISE NOTICE '=======================================';
END $$;

-- Lister toutes les tables dans le schéma public
SELECT 
  schemaname,
  tablename,
  tableowner,
  hasindexes,
  hasrules,
  hastriggers,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- =======================================
-- 2. AUDIT DES COLONNES PAR TABLE
-- =======================================

DO $$
DECLARE
  table_record RECORD;
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'STRUCTURE DES TABLES EXISTANTES';
  RAISE NOTICE '=======================================';
  
  FOR table_record IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  LOOP
    RAISE NOTICE '--- Table: % ---', table_record.tablename;
    
    PERFORM column_name, data_type, is_nullable, column_default
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = table_record.tablename
    ORDER BY ordinal_position;
  END LOOP;
END $$;

-- Détail des colonnes pour chaque table
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =======================================
-- 3. AUDIT DES CONTRAINTES ET CLÉS
-- =======================================

-- Clés primaires
SELECT 
  tc.table_name,
  kcu.column_name as primary_key_column
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'PRIMARY KEY'
ORDER BY tc.table_name;

-- Clés étrangères
SELECT 
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =======================================
-- 4. AUDIT DES INDEX EXISTANTS
-- =======================================

SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =======================================
-- 5. AUDIT DES POLITIQUES RLS
-- =======================================

-- Tables avec RLS activé
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- Politiques RLS existantes
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =======================================
-- 6. AUDIT DES FONCTIONS EXISTANTES
-- =======================================

SELECT 
  routine_name,
  routine_type,
  data_type as return_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public'
  AND routine_type = 'FUNCTION'
ORDER BY routine_name;

-- =======================================
-- 7. AUDIT DES TRIGGERS EXISTANTS
-- =======================================

SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- =======================================
-- 8. AUDIT DES EXTENSIONS SUPABASE
-- =======================================

-- Extensions installées
SELECT 
  extname as extension_name,
  extversion as version
FROM pg_extension
ORDER BY extname;

-- =======================================
-- 9. AUDIT DES UTILISATEURS ET RÔLES
-- =======================================

-- Vérifier si la table auth.users existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'auth' 
  AND table_name = 'users'
) as auth_users_exists;

-- Compter les utilisateurs si la table existe
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    PERFORM COUNT(*) FROM auth.users;
    RAISE NOTICE 'Nombre d''utilisateurs dans auth.users: %', (SELECT COUNT(*) FROM auth.users);
  ELSE
    RAISE NOTICE 'Table auth.users n''existe pas';
  END IF;
END $$;

-- =======================================
-- 10. AUDIT DES DONNÉES EXISTANTES
-- =======================================

DO $$
DECLARE
  table_record RECORD;
  row_count INTEGER;
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'NOMBRE DE LIGNES PAR TABLE';
  RAISE NOTICE '=======================================';
  
  FOR table_record IN 
    SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
  LOOP
    EXECUTE format('SELECT COUNT(*) FROM public.%I', table_record.tablename) INTO row_count;
    RAISE NOTICE 'Table %: % lignes', table_record.tablename, row_count;
  END LOOP;
END $$;

-- =======================================
-- 11. VÉRIFICATION DES MIGRATIONS SUPABASE
-- =======================================

-- Vérifier si la table supabase_migrations existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'supabase_migrations' 
  AND table_name = 'schema_migrations'
) as migrations_table_exists;

-- Lister les migrations si elles existent
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations') THEN
    RAISE NOTICE 'Migrations Supabase trouvées:';
    PERFORM version FROM supabase_migrations.schema_migrations ORDER BY version;
  ELSE
    RAISE NOTICE 'Aucune table de migrations trouvée';
  END IF;
END $$;

-- =======================================
-- 12. RÉSUMÉ DE L'AUDIT
-- =======================================

DO $$
DECLARE
  table_count INTEGER;
  function_count INTEGER;
  policy_count INTEGER;
  index_count INTEGER;
BEGIN
  -- Compter les éléments
  SELECT COUNT(*) INTO table_count FROM pg_tables WHERE schemaname = 'public';
  SELECT COUNT(*) INTO function_count FROM information_schema.routines WHERE routine_schema = 'public';
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE schemaname = 'public';
  SELECT COUNT(*) INTO index_count FROM pg_indexes WHERE schemaname = 'public';
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'RÉSUMÉ DE L''AUDIT SUPABASE';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '📊 Tables publiques: %', table_count;
  RAISE NOTICE '⚙️  Fonctions: %', function_count;
  RAISE NOTICE '🔒 Politiques RLS: %', policy_count;
  RAISE NOTICE '📈 Index: %', index_count;
  RAISE NOTICE '=======================================';
  
  IF table_count = 0 THEN
    RAISE NOTICE '⚠️  AUCUNE TABLE TROUVÉE - Base vide ou nouvelle';
    RAISE NOTICE '✅ Recommandation: Exécuter create-base-schema.sql';
  ELSE
    RAISE NOTICE '✅ Base de données existante détectée';
    RAISE NOTICE '✅ Recommandation: Analyser les résultats pour migration';
  END IF;
  
  RAISE NOTICE '=======================================';
END $$;
