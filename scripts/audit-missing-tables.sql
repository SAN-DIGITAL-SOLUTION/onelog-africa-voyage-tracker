-- Audit complet des tables manquantes
-- Diagnostic des erreurs 400 sur notifications et missions

-- 1. Vérifier l'existence des tables critiques
SELECT 
    'Table Audit' as audit_type,
    table_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = t.table_name
        ) THEN '✅ EXISTS'
        ELSE '❌ MISSING'
    END as status
FROM (
    VALUES 
    ('notifications'),
    ('missions'),
    ('users'),
    ('profiles'),
    ('user_roles'),
    ('roles'),
    ('tracking_points'),
    ('demandes'),
    ('chauffeurs')
) AS t(table_name);

-- 2. Vérifier les colonnes de la table notifications si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table notifications existe - Vérification des colonnes...';
        
        -- Afficher la structure de la table notifications
        PERFORM column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'notifications' AND table_schema = 'public'
        ORDER BY ordinal_position;
    ELSE
        RAISE NOTICE '❌ Table notifications MANQUANTE';
    END IF;
END $$;

-- 3. Vérifier les colonnes de la table missions si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table missions existe - Vérification des colonnes...';
    ELSE
        RAISE NOTICE '❌ Table missions MANQUANTE';
    END IF;
END $$;

-- 4. Vérifier les politiques RLS
SELECT 
    'RLS Policies' as audit_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('notifications', 'missions', 'users', 'profiles')
ORDER BY tablename, policyname;

-- 5. Compter les enregistrements dans les tables existantes
SELECT 'users count' as info, COUNT(*) as count FROM public.users;

-- 6. Vérifier les permissions sur les tables
SELECT 
    'Table Permissions' as audit_type,
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('notifications', 'missions', 'users', 'profiles')
ORDER BY table_name, grantee;
