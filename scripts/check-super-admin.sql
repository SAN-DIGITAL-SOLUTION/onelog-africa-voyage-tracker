-- Script de vérification du compte super administrateur
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

-- 2. Vérifier si le profil existe
SELECT 
  id,
  email,
  role,
  created_at,
  updated_at
FROM profiles 
WHERE email = 'san@sandigitalsolutions.com';

-- 3. Vérifier si le rôle super_admin existe
SELECT id, name, description 
FROM roles 
WHERE name = 'super_admin';

-- 4. Vérifier l'assignation du rôle à l'utilisateur
SELECT 
  ur.user_id,
  ur.role_id,
  r.name as role_name,
  u.email
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'san@sandigitalsolutions.com';

-- 5. Vérifier toutes les assignations de rôles pour cet utilisateur
SELECT 
  u.email,
  r.name as role_name,
  ur.assigned_at
FROM auth.users u
JOIN user_roles ur ON u.id = ur.user_id
JOIN roles r ON ur.role_id = r.id
WHERE u.email = 'san@sandigitalsolutions.com';

-- 6. Si l'utilisateur n'existe pas, afficher un message d'aide
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'san@sandigitalsolutions.com') THEN
    RAISE NOTICE 'UTILISATEUR NON TROUVÉ: san@sandigitalsolutions.com';
    RAISE NOTICE 'ACTIONS REQUISES:';
    RAISE NOTICE '1. L''utilisateur doit d''abord s''inscrire via l''interface web';
    RAISE NOTICE '2. Utiliser l''email: san@sandigitalsolutions.com';
    RAISE NOTICE '3. Utiliser le mot de passe: voyagetracker2025*#';
    RAISE NOTICE '4. Après inscription, exécuter: SELECT assign_super_admin_role(''san@sandigitalsolutions.com'');';
  ELSE
    RAISE NOTICE 'Utilisateur trouvé dans auth.users';
  END IF;
END $$;
