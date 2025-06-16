
-- Activer la réplication complète pour la table missions pour les mises à jour en temps réel
ALTER TABLE public.missions REPLICA IDENTITY FULL;

-- Ajouter la table missions à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.missions;

-- Activer la réplication complète pour mission_status_history
ALTER TABLE public.mission_status_history REPLICA IDENTITY FULL;

-- Ajouter mission_status_history à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mission_status_history;

-- Créer une fonction pour envoyer automatiquement une notification lors du changement de statut
CREATE OR REPLACE FUNCTION public.notify_mission_status_change()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  notification_message TEXT;
  client_email TEXT;
BEGIN
  -- Construire le message de notification
  notification_message := 'Le statut de votre mission ' || NEW.ref || ' a été mis à jour : ' || NEW.status;
  
  -- Récupérer l'email du client (supposons qu'il soit dans le champ client pour l'instant)
  client_email := NEW.client;
  
  -- Insérer une notification automatique dans la table notifications
  INSERT INTO public.notifications (
    user_id,
    type,
    target,
    message,
    mission_id,
    trigger,
    sent_at
  ) VALUES (
    NEW.user_id,
    'email',
    client_email,
    notification_message,
    NEW.id,
    NEW.status,
    now()
  );
  
  RETURN NEW;
END;
$$;

-- Créer le déclencheur pour les changements de statut
CREATE OR REPLACE TRIGGER trigger_notify_mission_status_change
  AFTER UPDATE OF status ON public.missions
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION public.notify_mission_status_change();
