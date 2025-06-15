
-- Extension : stockage contextuel et typé des notifications

ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS mission_id UUID,
  ADD COLUMN IF NOT EXISTS trigger TEXT;    -- ex: 'created', 'delivered', 'modified', etc.

-- Index pour faciliter les recherches par mission
CREATE INDEX IF NOT EXISTS idx_notifications_mission_id
  ON public.notifications (mission_id);

-- Index pour faciliter les recherches par trigger
CREATE INDEX IF NOT EXISTS idx_notifications_trigger
  ON public.notifications (trigger);

-- Si jamais les politiques RLS ne sont pas présentes, on les ajoute (adaptées, sécurisées et modulaires)
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Seul l''utilisateur connecté voit ses notifications'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Seul l''utilisateur connecté voit ses notifications"
      ON public.notifications
      FOR SELECT USING (user_id = auth.uid());';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Seul l''utilisateur connecté peut ajouter une notification'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Seul l''utilisateur connecté peut ajouter une notification"
      ON public.notifications
      FOR INSERT WITH CHECK (user_id = auth.uid());';
  END IF;
END
$do$;

-- (Optionnel) Pour permettre la suppression par le propriétaire
DO $do$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Seul l''utilisateur connecté peut supprimer une notification'
      AND tablename = 'notifications'
  ) THEN
    EXECUTE 'CREATE POLICY "Seul l''utilisateur connecté peut supprimer une notification"
      ON public.notifications FOR DELETE USING (user_id = auth.uid());';
  END IF;
END
$do$;
