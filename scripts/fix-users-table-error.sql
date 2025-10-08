-- =======================================
-- CORRECTION ERREUR TABLE public.users
-- Résout "Could not find the table 'public.users'"
-- =======================================

-- 1. Créer la table users si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fullname TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques RLS pour la table users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 4. Politique pour les super admins
DROP POLICY IF EXISTS "Super admins can manage all users" ON public.users;
CREATE POLICY "Super admins can manage all users" ON public.users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'super_admin'
            AND ur.role_status = 'approved'
        )
    );

-- 5. Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Synchroniser les données existantes depuis auth.users
INSERT INTO public.users (id, fullname, phone, created_at, updated_at)
SELECT 
    u.id,
    COALESCE(u.raw_user_meta_data->>'fullname', '') as fullname,
    COALESCE(u.raw_user_meta_data->>'phone', u.phone, '') as phone,
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = u.id
);

-- 7. Créer des index pour les performances
CREATE INDEX IF NOT EXISTS idx_users_fullname ON public.users(fullname);
CREATE INDEX IF NOT EXISTS idx_users_phone ON public.users(phone);

-- 8. Accorder les permissions
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Notification de succès
DO $$
BEGIN
    RAISE NOTICE '=== TABLE public.users CRÉÉE AVEC SUCCÈS ===';
    RAISE NOTICE 'Table: public.users';
    RAISE NOTICE 'RLS: Activé';
    RAISE NOTICE 'Politiques: Créées';
    RAISE NOTICE 'Triggers: Créés';
    RAISE NOTICE 'Données: Synchronisées';
    RAISE NOTICE '==========================================';
END $$;
