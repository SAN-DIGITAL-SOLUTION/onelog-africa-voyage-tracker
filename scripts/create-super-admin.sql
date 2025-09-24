-- Script de création du compte super administrateur
-- Email: san@sandigitalsolutions.com
-- Rôle: super_admin avec tous les privilèges

-- 1. Créer le rôle super_admin s'il n'existe pas
INSERT INTO roles (name, description) 
VALUES ('super_admin', 'Super Administrateur - Accès complet à toutes les fonctionnalités')
ON CONFLICT (name) DO NOTHING;

-- 2. Créer les permissions spéciales pour super_admin
INSERT INTO permissions (name, description) VALUES 
('manage_all_users', 'Gérer tous les utilisateurs'),
('manage_all_missions', 'Gérer toutes les missions'),
('manage_all_roles', 'Gérer tous les rôles et permissions'),
('access_all_dashboards', 'Accéder à tous les tableaux de bord'),
('manage_system_config', 'Gérer la configuration système'),
('view_all_analytics', 'Voir toutes les analytics'),
('manage_billing', 'Gérer la facturation globale'),
('manage_notifications', 'Gérer toutes les notifications')
ON CONFLICT (name) DO NOTHING;

-- 3. Politique RLS pour super_admin (accès total)
CREATE POLICY "Super admin can do everything" ON users FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

CREATE POLICY "Super admin can manage all missions" ON missions FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

CREATE POLICY "Super admin can manage all notifications" ON notifications FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    JOIN roles r ON ur.role_id = r.id 
    WHERE ur.user_id = auth.uid() AND r.name = 'super_admin'
  )
);

-- 4. Fonction pour assigner le rôle super_admin à un utilisateur
CREATE OR REPLACE FUNCTION assign_super_admin_role(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_user_id UUID;
  super_admin_role_id INTEGER;
BEGIN
  -- Trouver l'utilisateur par email
  SELECT id INTO target_user_id 
  FROM auth.users 
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RETURN 'Utilisateur non trouvé avec email: ' || user_email;
  END IF;
  
  -- Trouver l'ID du rôle super_admin
  SELECT id INTO super_admin_role_id 
  FROM roles 
  WHERE name = 'super_admin';
  
  IF super_admin_role_id IS NULL THEN
    RETURN 'Rôle super_admin non trouvé';
  END IF;
  
  -- Assigner le rôle
  INSERT INTO user_roles (user_id, role_id)
  VALUES (target_user_id, super_admin_role_id)
  ON CONFLICT (user_id, role_id) DO NOTHING;
  
  -- Créer ou mettre à jour le profil
  INSERT INTO profiles (id, email, role, created_at, updated_at)
  VALUES (
    target_user_id, 
    user_email, 
    'super_admin',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = 'super_admin',
    updated_at = NOW();
    
  RETURN 'Super admin role assigné avec succès à: ' || user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Exécuter l'assignation pour san@sandigitalsolutions.com
-- Note: Cette fonction sera exécutée après que l'utilisateur se soit inscrit
SELECT assign_super_admin_role('san@sandigitalsolutions.com');
