-- Vérification de l'état réel de la base de données OneLog Africa
-- Pour s'assurer qu'on ne crée pas de doublons

-- 1. Lister TOUTES les tables existantes dans le schéma public
SELECT 
    'Tables existantes' as audit_type,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Vérifier spécifiquement les tables critiques
SELECT 
    'État des tables critiques' as audit_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') 
        THEN 'notifications: ✅ EXISTE'
        ELSE 'notifications: ❌ MANQUANTE'
    END as notifications_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions' AND table_schema = 'public') 
        THEN 'missions: ✅ EXISTE'
        ELSE 'missions: ❌ MANQUANTE'
    END as missions_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') 
        THEN 'user_roles: ✅ EXISTE'
        ELSE 'user_roles: ❌ MANQUANTE'
    END as user_roles_status,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN 'users: ✅ EXISTE'
        ELSE 'users: ❌ MANQUANTE'
    END as users_status;

-- 3. Compter les enregistrements dans les tables existantes
DO $$
BEGIN
    -- Notifications
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        PERFORM 'notifications', COUNT(*) FROM public.notifications;
        RAISE NOTICE 'Table notifications: % enregistrements', (SELECT COUNT(*) FROM public.notifications);
    ELSE
        RAISE NOTICE 'Table notifications: N/A (table manquante)';
    END IF;

    -- Missions
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table missions: % enregistrements', (SELECT COUNT(*) FROM public.missions);
    ELSE
        RAISE NOTICE 'Table missions: N/A (table manquante)';
    END IF;

    -- User roles
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table user_roles: % enregistrements', (SELECT COUNT(*) FROM public.user_roles);
    ELSE
        RAISE NOTICE 'Table user_roles: N/A (table manquante)';
    END IF;

    -- Users
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table users: % enregistrements', (SELECT COUNT(*) FROM public.users);
    ELSE
        RAISE NOTICE 'Table users: N/A (table manquante)';
    END IF;

    RAISE NOTICE '=== VÉRIFICATION TERMINÉE ===';
END $$;

-- 4. Vérifier les colonnes des tables existantes
SELECT 
    'Structure notifications' as audit_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'notifications' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 
    'Structure user_roles' as audit_type,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_roles' AND table_schema = 'public'
ORDER BY ordinal_position;
