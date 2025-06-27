-- Migration SQL : RLS notification_preferences

-- Table déjà créée ? Sinon, créer la table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT true,
  whatsapp_enabled boolean DEFAULT true,
  in_app_enabled boolean DEFAULT true,
  preferences jsonb DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy : chaque utilisateur ne peut voir/modifier que ses préférences
CREATE POLICY "Users can view their notification preferences" ON public.notification_preferences
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their notification preferences" ON public.notification_preferences
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their notification preferences" ON public.notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Optionnel : empêcher la suppression directe (soft delete via update possible)
REVOKE DELETE ON public.notification_preferences FROM PUBLIC;
