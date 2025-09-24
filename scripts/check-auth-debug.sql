-- Script de diagnostic pour l'authentification OneLog Africa
-- Vérifie l'état de l'utilisateur san@sandigitalsolutions.com

-- 1. Vérifier si l'utilisateur existe dans auth.users
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    raw_user_meta_data,
    encrypted_password IS NOT NULL as has_password
FROM auth.users 
WHERE email = 'san@sandigitalsolutions.com';

-- 2. Vérifier le profil dans la table profiles
SELECT 
    id,
    full_name,
    phone,
    created_at
FROM public.profiles 
WHERE id IN (
    SELECT id FROM auth.users WHERE email = 'san@sandigitalsolutions.com'
);

-- 3. Vérifier les rôles assignés
SELECT 
    ur.user_id,
    ur.role_id,
    ur.role_status,
    r.name as role_name,
    r.description
FROM public.user_roles ur
JOIN public.roles r ON ur.role_id = r.id
WHERE ur.user_id IN (
    SELECT id FROM auth.users WHERE email = 'san@sandigitalsolutions.com'
);

-- 4. Vérifier la structure de la table roles
SELECT name, description FROM public.roles ORDER BY id;

-- 5. Test de création d'utilisateur si nécessaire
DO $$
DECLARE
    user_exists BOOLEAN;
    user_uuid UUID;
    super_admin_role_id INTEGER;
BEGIN
    -- Vérifier si l'utilisateur existe
    SELECT EXISTS(
        SELECT 1 FROM auth.users 
        WHERE email = 'san@sandigitalsolutions.com'
    ) INTO user_exists;
    
    RAISE NOTICE 'Utilisateur existe: %', user_exists;
    
    IF user_exists THEN
        -- Récupérer l'ID utilisateur
        SELECT id INTO user_uuid FROM auth.users WHERE email = 'san@sandigitalsolutions.com';
        RAISE NOTICE 'ID utilisateur: %', user_uuid;
        
        -- Vérifier le rôle super_admin
        SELECT id INTO super_admin_role_id FROM public.roles WHERE name = 'super_admin';
        RAISE NOTICE 'ID rôle super_admin: %', super_admin_role_id;
        
        -- Mettre à jour le mot de passe si nécessaire
        UPDATE auth.users 
        SET 
            encrypted_password = crypt('SuperAdmin2024!', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
            updated_at = NOW()
        WHERE id = user_uuid;
        
        RAISE NOTICE 'Mot de passe mis à jour pour: %', user_uuid;
        
    ELSE
        RAISE NOTICE 'Utilisateur non trouvé - exécuter le script de création';
    END IF;
END $$;
