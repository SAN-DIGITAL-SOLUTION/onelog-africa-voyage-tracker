-- RLS policies pour attribution flexible des rôles (user_roles)

-- 1. Permettre à chaque utilisateur de voir sa propre ligne
CREATE POLICY "User can view own user_roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 2. INSERT
-- Hybrid: l'utilisateur insère requested_role, role_status = 'pending'
-- Self-service: l'utilisateur insère role, role_status = 'approved'
CREATE POLICY "User can request role (hybrid/self_service)" ON public.user_roles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
      (role_status = 'pending' AND requested_role IS NOT NULL) OR
      (role_status = 'approved' AND role IS NOT NULL)
    )
  );

-- 3. UPDATE
-- L'utilisateur peut modifier requested_role si role_status != 'approved'
CREATE POLICY "User can update requested_role if not approved" ON public.user_roles
  FOR UPDATE USING (
    auth.uid() = user_id AND role_status != 'approved'
  ) WITH CHECK (
    requested_role IS NOT NULL
  );

-- 4. Admin peut approuver/rejeter (modifier role, role_status)
-- À adapter selon votre logique d'admin (ex: rôle dans JWT claims)
CREATE POLICY "Admin can approve/reject role requests" ON public.user_roles
  FOR UPDATE USING (
    auth.role() = 'service_role' OR (EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
    ))
  );

-- 5. Désactiver les accès par défaut si besoin
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.user_roles FROM anon, authenticated;
