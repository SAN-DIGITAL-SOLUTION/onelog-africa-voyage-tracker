-- CORRECTIF D'URGENCE - Stabilisation OneLog Africa
-- Résout les boucles infinies et erreurs 400 critiques

-- 1. Créer toutes les tables manquantes en une seule fois
DO $$
BEGIN
    -- Table notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'notifications' AND table_schema = 'public') THEN
        CREATE TABLE public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            type TEXT NOT NULL DEFAULT 'info',
            target TEXT,
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
        
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "notifications_policy" ON public.notifications
            FOR ALL USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur
                    JOIN public.roles r ON ur.role_id = r.id
                    WHERE ur.user_id = auth.uid() 
                    AND r.name IN ('super_admin', 'admin')
                    AND ur.role_status = 'approved'
                )
            );
            
        GRANT ALL ON public.notifications TO authenticated;
        RAISE NOTICE 'Table notifications créée';
    END IF;

    -- Table missions
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'missions' AND table_schema = 'public') THEN
        CREATE TABLE public.missions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            chauffeur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            exploiteur_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
            title TEXT NOT NULL DEFAULT 'Mission',
            description TEXT,
            pickup_location TEXT NOT NULL DEFAULT '',
            destination TEXT NOT NULL DEFAULT '',
            pickup_time TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "missions_policy" ON public.missions
            FOR ALL USING (
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
            
        GRANT ALL ON public.missions TO authenticated;
        RAISE NOTICE 'Table missions créée';
    END IF;

    -- Table tracking_points
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tracking_points' AND table_schema = 'public') THEN
        CREATE TABLE public.tracking_points (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
            latitude DECIMAL(10, 8) NOT NULL DEFAULT 0,
            longitude DECIMAL(11, 8) NOT NULL DEFAULT 0,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            speed DECIMAL(5, 2) DEFAULT 0,
            heading DECIMAL(5, 2) DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.tracking_points ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "tracking_points_policy" ON public.tracking_points
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM public.missions m 
                    WHERE m.id = mission_id 
                    AND (
                        auth.uid() = m.client_id OR 
                        auth.uid() = m.chauffeur_id OR 
                        auth.uid() = m.exploiteur_id OR
                        EXISTS (
                            SELECT 1 FROM public.user_roles ur
                            JOIN public.roles r ON ur.role_id = r.id
                            WHERE ur.user_id = auth.uid() 
                            AND r.name IN ('super_admin', 'admin')
                            AND ur.role_status = 'approved'
                        )
                    )
                )
            );
            
        GRANT ALL ON public.tracking_points TO authenticated;
        RAISE NOTICE 'Table tracking_points créée';
    END IF;

    -- Table demandes
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'demandes' AND table_schema = 'public') THEN
        CREATE TABLE public.demandes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            pickup_location TEXT NOT NULL DEFAULT '',
            destination TEXT NOT NULL DEFAULT '',
            pickup_time TIMESTAMP WITH TIME ZONE,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.demandes ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "demandes_policy" ON public.demandes
            FOR ALL USING (
                auth.uid() = client_id OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur
                    JOIN public.roles r ON ur.role_id = r.id
                    WHERE ur.user_id = auth.uid() 
                    AND r.name IN ('super_admin', 'admin', 'exploiteur')
                    AND ur.role_status = 'approved'
                )
            );
            
        GRANT ALL ON public.demandes TO authenticated;
        RAISE NOTICE 'Table demandes créée';
    END IF;

    -- Table chauffeurs
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chauffeurs' AND table_schema = 'public') THEN
        CREATE TABLE public.chauffeurs (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            license_number TEXT,
            vehicle_info JSONB DEFAULT '{}',
            status TEXT DEFAULT 'available',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.chauffeurs ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "chauffeurs_policy" ON public.chauffeurs
            FOR ALL USING (
                auth.uid() = user_id OR
                EXISTS (
                    SELECT 1 FROM public.user_roles ur
                    JOIN public.roles r ON ur.role_id = r.id
                    WHERE ur.user_id = auth.uid() 
                    AND r.name IN ('super_admin', 'admin', 'exploiteur')
                    AND ur.role_status = 'approved'
                )
            );
            
        GRANT ALL ON public.chauffeurs TO authenticated;
        RAISE NOTICE 'Table chauffeurs créée';
    END IF;

    -- Insérer des données de test pour éviter les erreurs
    INSERT INTO public.notifications (user_id, type, message, read) 
    SELECT id, 'welcome', 'Bienvenue sur OneLog Africa!', false 
    FROM auth.users 
    WHERE NOT EXISTS (SELECT 1 FROM public.notifications WHERE user_id = auth.users.id)
    LIMIT 5;

    RAISE NOTICE '=== CORRECTIF D''URGENCE APPLIQUÉ ===';
    RAISE NOTICE 'Tables créées et sécurisées';
    RAISE NOTICE 'Données de test insérées';
    RAISE NOTICE 'Application stabilisée';
    RAISE NOTICE '====================================';

END $$;
