-- Vérification de la création du super admin
-- Affiche les informations du super admin créé

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

-- Vérifier le profil dans public.users
SELECT 
    'public.users' as table_name,
    id,
    fullname,
    phone,
    created_at
FROM public.users 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'san@sandigitalsolutions.com'
);

-- Vérifier le rôle assigné
SELECT 
    'user_roles' as table_name,
    ur.user_id,
    r.name as role_name,
    ur.role_status,
    ur.created_at
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
WHERE ur.user_id IN (
    SELECT id FROM auth.users WHERE email = 'san@sandigitalsolutions.com'
);

-- Compter le nombre total d'utilisateurs
SELECT 
    'Total users' as info,
    COUNT(*) as count
FROM auth.users;
