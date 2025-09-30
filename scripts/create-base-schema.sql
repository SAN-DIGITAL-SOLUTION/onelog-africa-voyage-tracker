-- =======================================
-- CRÉATION DU SCHÉMA DE BASE SUPABASE
-- Tables et structures prérequises
-- =======================================

-- =======================================
-- 1. CRÉATION DES TABLES DE BASE
-- =======================================

-- Table des rôles
CREATE TABLE IF NOT EXISTS public.roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des permissions
CREATE TABLE IF NOT EXISTS public.permissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des rôles utilisateurs
CREATE TABLE IF NOT EXISTS public.user_roles (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role_id)
);

-- Table des profils utilisateurs
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(50),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des missions
CREATE TABLE IF NOT EXISTS public.missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  priority VARCHAR(20) DEFAULT 'medium',
  departure_location TEXT,
  arrival_location TEXT,
  departure_date TIMESTAMP WITH TIME ZONE,
  arrival_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des documents de missions
CREATE TABLE IF NOT EXISTS public.missions_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'info',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Table des préférences de notifications
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  email_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  push_notifications BOOLEAN DEFAULT TRUE,
  mission_updates BOOLEAN DEFAULT TRUE,
  system_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table des factures
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_id UUID REFERENCES public.missions(id) ON DELETE CASCADE,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'XOF',
  status VARCHAR(50) DEFAULT 'draft',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =======================================
-- 2. INSERTION DES DONNÉES DE BASE
-- =======================================

-- Rôles par défaut
INSERT INTO public.roles (name, description) VALUES 
('super_admin', 'Super Administrateur - Accès complet à toutes les fonctionnalités'),
('admin', 'Administrateur - Gestion des utilisateurs et missions'),
('manager', 'Gestionnaire - Supervision des opérations'),
('exploiteur', 'Exploiteur - Gestion des missions et véhicules'),
('chauffeur', 'Chauffeur - Exécution des missions de transport'),
('client', 'Client - Demande et suivi des missions')
ON CONFLICT (name) DO NOTHING;

-- Permissions de base
INSERT INTO public.permissions (name, description) VALUES 
('manage_users', 'Gérer les utilisateurs'),
('manage_missions', 'Gérer les missions'),
('manage_vehicles', 'Gérer les véhicules'),
('view_analytics', 'Voir les analytics'),
('manage_billing', 'Gérer la facturation'),
('manage_notifications', 'Gérer les notifications'),
('manage_system_config', 'Gérer la configuration système')
ON CONFLICT (name) DO NOTHING;

-- =======================================
-- 3. ACTIVATION RLS SUR TOUTES LES TABLES
-- =======================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- =======================================
-- 4. POLITIQUES RLS DE BASE
-- =======================================

-- Profils - Les utilisateurs peuvent voir et modifier leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (id = auth.uid());

-- Missions - Les utilisateurs peuvent voir leurs propres missions
CREATE POLICY "Users can view own missions" ON public.missions
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create missions" ON public.missions
FOR INSERT WITH CHECK (user_id = auth.uid());

-- Notifications - Les utilisateurs peuvent voir leurs propres notifications
CREATE POLICY "Users can view own notifications" ON public.notifications
FOR SELECT USING (user_id = auth.uid());

-- Préférences de notifications
CREATE POLICY "Users can view own preferences" ON public.notification_preferences
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own preferences" ON public.notification_preferences
FOR UPDATE USING (user_id = auth.uid());

-- =======================================
-- 5. INDEX POUR LES PERFORMANCES
-- =======================================

-- Index sur les clés étrangères
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_missions_user_id ON public.missions(user_id);
CREATE INDEX IF NOT EXISTS idx_missions_documents_mission_id ON public.missions_documents(mission_id);
CREATE INDEX IF NOT EXISTS idx_missions_documents_user_id ON public.missions_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON public.notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_mission_id ON public.invoices(mission_id);

-- Index sur les champs fréquemment recherchés
CREATE INDEX IF NOT EXISTS idx_missions_status ON public.missions(status);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- =======================================
-- 6. TRIGGERS ET FONCTIONS
-- =======================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON public.notification_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =======================================
-- 7. VÉRIFICATION ET RÉSUMÉ
-- =======================================

DO $$
BEGIN
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'SCHÉMA DE BASE CRÉÉ AVEC SUCCÈS';
  RAISE NOTICE '=======================================';
  RAISE NOTICE '✅ Tables créées: roles, permissions, user_roles, profiles';
  RAISE NOTICE '✅ Tables créées: missions, missions_documents, notifications';
  RAISE NOTICE '✅ Tables créées: notification_preferences, invoices';
  RAISE NOTICE '✅ Données de base insérées (rôles et permissions)';
  RAISE NOTICE '✅ RLS activé sur toutes les tables';
  RAISE NOTICE '✅ Politiques RLS de base créées';
  RAISE NOTICE '✅ Index de performance ajoutés';
  RAISE NOTICE '✅ Triggers pour updated_at configurés';
  RAISE NOTICE '=======================================';
  RAISE NOTICE 'PRÊT POUR LES OPTIMISATIONS DE SÉCURITÉ ET PERFORMANCE';
  RAISE NOTICE '=======================================';
END $$;
