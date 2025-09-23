
-- Vérifier les rôles assignés à l'utilisateur
SELECT 
  ur.role,
  u.email,
  ur.user_id
FROM user_roles ur
JOIN auth.users u ON ur.user_id = u.id
WHERE u.email = 'sandigitalsolutions70@gmail.com';

-- Vérifier aussi tous les utilisateurs et leurs rôles pour avoir une vue d'ensemble
SELECT 
  u.email,
  ur.role,
  ur.user_id
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
ORDER BY u.email, ur.role;
