-- Migration : Système de notifications maîtrisées
-- Contexte : Notifications pour facturation multi-acteurs et événements clés

-- Types énumérés
CREATE TYPE notification_type AS ENUM (
  'invoice_generated',
  'invoice_validated',
  'invoice_sent',
  'payment_received',
  'payment_overdue',
  'mission_completed',
  'billing_partner_updated',
  'system_error'
);

CREATE TYPE notification_channel AS ENUM (
  'email',
  'slack',
  'in_app',
  'sms'
);

CREATE TYPE notification_status AS ENUM (
  'pending',
  'sent',
  'failed',
  'read',
  'dismissed'
);

CREATE TYPE notification_priority AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Table principale des notifications
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Contenu de la notification
  title text NOT NULL,
  message text NOT NULL,
  type notification_type NOT NULL,
  priority notification_priority DEFAULT 'medium',
  
  -- Cibles et canaux
  user_id uuid REFERENCES auth.users(id),
  billing_partner_id uuid REFERENCES billing_partners(id),
  channel notification_channel NOT NULL,
  
  -- Données contextuelles
  related_entity_type text, -- 'invoice', 'mission', 'billing_partner'
  related_entity_id uuid,   -- ID de l'entité liée
  metadata jsonb DEFAULT '{}',
  
  -- Statut et suivi
  status notification_status DEFAULT 'pending',
  scheduled_at timestamp with time zone DEFAULT now(),
  sent_at timestamp with time zone,
  read_at timestamp with time zone,
  failed_reason text,
  retry_count integer DEFAULT 0,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les préférences de notification par utilisateur
CREATE TABLE user_notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) UNIQUE NOT NULL,
  
  -- Préférences par canal
  email_enabled boolean DEFAULT true,
  slack_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  
  -- Préférences par type
  preferences jsonb DEFAULT '{
    "invoice_generated": ["email", "in_app"],
    "invoice_validated": ["email"],
    "invoice_sent": ["email", "in_app"],
    "payment_received": ["email"],
    "payment_overdue": ["email", "in_app", "sms"],
    "mission_completed": ["in_app"],
    "billing_partner_updated": ["in_app"],
    "system_error": ["email", "in_app"]
  }',
  
  -- Paramètres de réception
  quiet_hours jsonb DEFAULT '{"start": "22:00", "end": "08:00"}',
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table pour les webhooks et intégrations
CREATE TABLE notification_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  channel notification_channel NOT NULL,
  url text NOT NULL,
  secret text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Index pour performance
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_scheduled ON notifications(scheduled_at);
CREATE INDEX idx_notifications_entity ON notifications(related_entity_type, related_entity_id);
CREATE INDEX idx_notifications_partner ON notifications(billing_partner_id);

-- Index pour les préférences
CREATE INDEX idx_user_prefs_user_id ON user_notification_preferences(user_id);

-- RLS Policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies pour notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (
    user_id = auth.uid() OR 
    billing_partner_id IN (
      SELECT id FROM billing_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true);

-- Policies pour préférences
CREATE POLICY "Users can manage their preferences" ON user_notification_preferences
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view preferences" ON user_notification_preferences
  FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_prefs_updated_at BEFORE UPDATE ON user_notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement les préférences utilisateur
CREATE OR REPLACE FUNCTION create_user_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_notification_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_user_prefs_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_notification_preferences();

-- Fonction pour créer des notifications automatiques
CREATE OR REPLACE FUNCTION create_invoice_notification()
RETURNS TRIGGER AS $$
DECLARE
  partner_record RECORD;
  user_record RECORD;
BEGIN
  -- Récupérer les infos du partenaire
  SELECT * INTO partner_record
  FROM billing_partners
  WHERE id = NEW.billing_partner_id;

  -- Notification pour le partenaire
  IF partner_record.contact_email IS NOT NULL THEN
    INSERT INTO notifications (
      title,
      message,
      type,
      priority,
      channel,
      billing_partner_id,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'Nouvelle facture générée',
      format('Une facture de %s a été générée pour la période %s - %s',
        NEW.total_amount,
        NEW.period_start,
        NEW.period_end
      ),
      'invoice_generated',
      'medium',
      'email',
      NEW.billing_partner_id,
      'invoice',
      NEW.id,
      jsonb_build_object('total_amount', NEW.total_amount, 'period', format('%s - %s', NEW.period_start, NEW.period_end))
    );
  END IF;

  -- Notification pour les admins
  FOR user_record IN 
    SELECT * FROM auth.users WHERE raw_user_meta_data ->> 'role' = 'admin'
  LOOP
    INSERT INTO notifications (
      title,
      message,
      type,
      priority,
      channel,
      user_id,
      related_entity_type,
      related_entity_id,
      metadata
    ) VALUES (
      'Facture générée',
      format('Facture %s générée pour %s', NEW.id, partner_record.name),
      'invoice_generated',
      'low',
      'in_app',
      user_record.id,
      'invoice',
      NEW.id,
      jsonb_build_object('partner_name', partner_record.name)
    );
  END LOOP;

  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour notifications automatiques
CREATE TRIGGER notify_on_invoice_generation
  AFTER INSERT ON grouped_invoices
  FOR EACH ROW EXECUTE FUNCTION create_invoice_notification();

-- Données de test
INSERT INTO notification_webhooks (name, channel, url, is_active) VALUES
('Email Service', 'email', 'https://api.mailersend.com/v1/email', true),
('Slack Webhook', 'slack', 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK', false);
