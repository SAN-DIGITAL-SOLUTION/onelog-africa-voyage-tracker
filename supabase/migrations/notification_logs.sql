-- Table de logs pour le fallback notifications
CREATE TABLE IF NOT EXISTS notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id uuid REFERENCES notifications(id),
  user_id uuid REFERENCES users(id),
  channel text, -- push, sms, email
  status text, -- sent, read, failed, fallback_sent
  retry_count integer DEFAULT 0,
  fallback_channel text, -- sms, email
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_id ON notification_logs(user_id);
