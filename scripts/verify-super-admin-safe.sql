-- Vérification sécurisée du super admin
-- Évite l'erreur si public.users n'existe pas

-- Vérifier l'utilisateur dans auth.users
SELECT 
    'auth.users' as table_name,
    id,
    email,
    email_confirmed_at IS NOT NULL as email_confirmed,
    raw_user_meta_data->>'role' as role,
    raw_user_meta_data->>'fullname' as fullname,
    raw_user_meta_data->>'phone' as phone,
    raw_user_meta_data->>'onboarding_complete' as onboarding_complete,
    created_at
FROM auth.users 
WHERE email = 'san@sandigitalsolutions.com';

-- Vérifier si la table public.users existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'users'
        ) THEN 'Table public.users existe'
        ELSE 'Table public.users MANQUANTE - Exécutez 01-fix-users-table.sql'
    END as status_table_users;

-- Vérifier le rôle assigné (si les tables existent)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'user_roles'
        ) THEN 'Table user_roles existe'
        ELSE 'Table user_roles manquante'
    END as status_user_roles;

-- Compter le nombre total d'utilisateurs
SELECT 
    'Total users in auth.users' as info,
    COUNT(*) as count
FROM auth.users;
