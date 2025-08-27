-- Création des tables manquantes pour OneLog Africa
-- Résout les erreurs 400 sur notifications et missions

-- 1. Créer la table notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    target TEXT NOT NULL,
    message TEXT NOT NULL,
    mission_id UUID,
    trigger TEXT,
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read BOOLEAN DEFAULT FALSE,
    user_role TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Créer la table missions
CREATE TABLE IF NOT EXISTS public.missions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    chauffeur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    exploiteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table tracking_points
CREATE TABLE IF NOT EXISTS public.tracking_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mission_id UUID NOT NULL REFERENCES public.missions(id) ON DELETE CASCADE,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    speed DECIMAL(5, 2),
    heading DECIMAL(5, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table demandes
CREATE TABLE IF NOT EXISTS public.demandes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pickup_location TEXT NOT NULL,
    destination TEXT NOT NULL,
    pickup_time TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Créer la table chauffeurs
CREATE TABLE IF NOT EXISTS public.chauffeurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    license_number TEXT,
    vehicle_info JSONB,
    status TEXT DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Créer la table notification_logs
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID REFERENCES public.notifications(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    content TEXT,
    metadata JSONB,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Activer RLS sur toutes les tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.demandes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chauffeurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- 8. Politiques RLS pour notifications
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
CREATE POLICY "Users can insert own notifications" ON public.notifications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Super admins can manage all notifications" ON public.notifications;
CREATE POLICY "Super admins can manage all notifications" ON public.notifications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'super_admin'
            AND ur.role_status = 'approved'
        )
    );

-- 9. Politiques RLS pour missions
DROP POLICY IF EXISTS "Users can view related missions" ON public.missions;
CREATE POLICY "Users can view related missions" ON public.missions
    FOR SELECT USING (
        auth.uid() = client_id OR 
        auth.uid() = chauffeur_id OR 
        auth.uid() = exploiteur_id OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('super_admin', 'admin')
            AND ur.role_status = 'approved'
        )
    );

DROP POLICY IF EXISTS "Users can insert missions" ON public.missions;
CREATE POLICY "Users can insert missions" ON public.missions
    FOR INSERT WITH CHECK (
        auth.uid() = client_id OR
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('super_admin', 'admin', 'exploiteur')
            AND ur.role_status = 'approved'
        )
    );

-- 10. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_missions_client_id ON public.missions(client_id);
CREATE INDEX IF NOT EXISTS idx_missions_chauffeur_id ON public.missions(chauffeur_id);
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_tracking_points_mission_id ON public.tracking_points(mission_id);

-- 11. Créer des triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_notifications_updated_at ON public.notifications;
CREATE TRIGGER update_notifications_updated_at
    BEFORE UPDATE ON public.notifications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON public.missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 12. Accorder les permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.missions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tracking_points TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demandes TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chauffeurs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_logs TO authenticated;

GRANT SELECT ON public.notifications TO anon;
GRANT SELECT ON public.missions TO anon;
