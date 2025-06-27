-- Table notifications :
-- RLS : seuls les destinataires voient leurs notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications: users read own" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Trigger : broadcast via NOTIFY après insert
CREATE OR REPLACE FUNCTION notify_new_notification() RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify('notifications_realtime', row_to_json(NEW)::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS notification_notify_trigger ON notifications;
CREATE TRIGGER notification_notify_trigger
AFTER INSERT ON notifications
FOR EACH ROW EXECUTE FUNCTION notify_new_notification();
