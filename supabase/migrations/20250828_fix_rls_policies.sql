-- Jour 1 - Sécurité : Fix RLS policies pour restrictions cross-org

-- Activer RLS sur toutes les tables critiques
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE grouped_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Fonction helper pour récupérer l'org_id de l'utilisateur
CREATE OR REPLACE FUNCTION get_user_org_id(user_uuid uuid)
RETURNS uuid AS $$
BEGIN
  RETURN (SELECT organization_id FROM user_roles WHERE user_id = user_uuid LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policy pour missions - accès uniquement à son organisation
CREATE POLICY "missions_access_policy" ON public.missions
FOR ALL USING (
  organization_id = get_user_org_id(auth.uid())
);

-- Policy pour vehicles - accès uniquement à son organisation
CREATE POLICY "vehicles_access_policy" ON public.vehicles
FOR ALL USING (
  organization_id = get_user_org_id(auth.uid())
);

-- Policy pour clients - accès uniquement à son organisation
CREATE POLICY "clients_access_policy" ON public.clients
FOR ALL USING (
  organization_id = get_user_org_id(auth.uid())
);

-- Policy pour drivers - accès uniquement à son organisation
CREATE POLICY "drivers_access_policy" ON public.drivers
FOR ALL USING (
  organization_id = get_user_org_id(auth.uid())
);

-- Policy pour billing_partners - accès uniquement à son organisation
CREATE POLICY "billing_partners_policy" ON public.billing_partners
FOR ALL USING (
  organization_id = get_user_org_id(auth.uid())
);

-- Policy pour notifications - accès uniquement à ses propres notifications
CREATE POLICY "notifications_policy" ON public.notifications
FOR ALL USING (
  user_id = auth.uid() OR 
  user_id IN (SELECT id FROM users WHERE organization_id = get_user_org_id(auth.uid()))
);

-- Tests des policies
SELECT policyname, tablename, cmd, qual FROM pg_policies WHERE tablename IN ('missions', 'vehicles', 'clients', 'drivers', 'billing_partners', 'notifications');
