-- Script de vérification du compte super administrateur (CORRIGÉ)
-- Email: san@sandigitalsolutions.com

-- 1. Vérifier si l'utilisateur existe dans auth.users
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'san@sandigitalsolutions.com';

-- 2. Vérifier la structure de la table profiles
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Vérifier si le profil existe (sans colonne email)
SELECT 
  id,
  created_at,
  updated_at
FROM profiles 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'san@sandigitalsolutions.com'
);

-- 4. Vérifier si le rôle super_admin existe dans la table roles
SELECT id, name, description 
FROM roles 
WHERE name = 'super_admin';

-- 5. Vérifier la structure de user_roles (colonne role_id ajoutée?)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 6. Vérifier l'assignation du rôle à l'utilisateur via role_id
SELECT 
  ur.user_id,
  ur.role_id,
  r.name as role_name,
  u.email,
  ur.role_status
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'san@sandigitalsolutions.com';

-- 7. Vérifier l'assignation via enum role (fallback)
SELECT 
  ur.user_id,
  ur.role::text as role_enum,
  u.email,
  ur.role_status
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'san@sandigitalsolutions.com';

-- 8. Compter tous les super_admin (role_id)
SELECT COUNT(*) as super_admin_count_role_id
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
WHERE r.name = 'super_admin' AND ur.role_status = 'approved';

-- 9. Diagnostic final
DO $$
DECLARE
  user_exists BOOLEAN;
  role_exists BOOLEAN;
  role_id_column_exists BOOLEAN;
  super_admin_assigned BOOLEAN;
BEGIN
  -- Vérifier utilisateur
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'san@sandigitalsolutions.com') INTO user_exists;
  
  -- Vérifier rôle super_admin
  SELECT EXISTS(SELECT 1 FROM roles WHERE name = 'super_admin') INTO role_exists;
  
  -- Vérifier colonne role_id
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_roles' AND column_name = 'role_id'
  ) INTO role_id_column_exists;
  
  -- Vérifier assignation super_admin
  SELECT EXISTS(
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    JOIN auth.users u ON ur.user_id = u.id
    WHERE u.email = 'san@sandigitalsolutions.com' 
    AND r.name = 'super_admin' 
    AND ur.role_status = 'approved'
  ) INTO super_admin_assigned;
  
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'DIAGNOSTIC SUPER ADMIN';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '👤 Utilisateur san@sandigitalsolutions.com: %', CASE WHEN user_exists THEN '✅ Existe' ELSE '❌ Manquant' END;
  RAISE NOTICE '🏷️  Rôle super_admin dans table roles: %', CASE WHEN role_exists THEN '✅ Existe' ELSE '❌ Manquant' END;
  RAISE NOTICE '🔗 Colonne role_id dans user_roles: %', CASE WHEN role_id_column_exists THEN '✅ Existe' ELSE '❌ Manquante' END;
  RAISE NOTICE '🎯 Super admin assigné: %', CASE WHEN super_admin_assigned THEN '✅ Configuré' ELSE '❌ Non assigné' END;
  RAISE NOTICE '=======================================';
  
  IF NOT user_exists THEN
    RAISE NOTICE '⚠️  ACTION REQUISE: L''utilisateur doit s''inscrire d''abord';
    RAISE NOTICE '📧 Email: san@sandigitalsolutions.com';
    RAISE NOTICE '🔑 Mot de passe suggéré: voyagetracker2025*#';
  END IF;
  
  IF NOT role_exists THEN
    RAISE NOTICE '⚠️  ACTION REQUISE: Créer le rôle super_admin';
  END IF;
  
  IF NOT role_id_column_exists THEN
    RAISE NOTICE '⚠️  ACTION REQUISE: Ajouter la colonne role_id à user_roles';
  END IF;
  
  IF user_exists AND role_exists AND role_id_column_exists AND NOT super_admin_assigned THEN
    RAISE NOTICE '⚠️  ACTION REQUISE: Assigner le rôle super_admin à l''utilisateur';
  END IF;
  
  RAISE NOTICE '=======================================';
END $$;
