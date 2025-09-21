-- Migration pour les notifications maîtrisées (P0 - transporteurs)
-- Aligné sur la vision stratégique OneLog Africa - Phase 1 Production Ready

-- Créer la table pour les règles de notification personnalisables
CREATE TABLE IF NOT EXISTS notification_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL CHECK (trigger_event IN (
    'mission_created', 'mission_started', 'mission_completed', 
    'position_update', 'delay_detected', 'incident_reported',
    'invoice_generated', 'payment_received'
  )),
  is_active BOOLEAN DEFAULT true,
  mode TEXT DEFAULT 'automatic' CHECK (mode IN ('automatic', 'manual', 'disabled')),
  channels TEXT[] DEFAULT ARRAY['email'],
  conditions JSONB DEFAULT '{}',
  template_config JSONB DEFAULT '{}',
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table pour les templates de notification personnalisés
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  event_type TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'webhook')),
  language TEXT DEFAULT 'fr' CHECK (language IN ('fr', 'en', 'es')),
  subject_template TEXT,
  body_template TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_default BOOLEAN DEFAULT false,
  organization_id UUID,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table pour les paramètres globaux de notification
CREATE TABLE IF NOT EXISTS notification_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scope TEXT NOT NULL CHECK (scope IN ('global', 'organization', 'user')),
  scope_id UUID,
  mode TEXT DEFAULT 'automatic' CHECK (mode IN ('automatic', 'manual')),
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scope, scope_id)
);

-- Améliorer la table notification_logs existante pour l'audit trail
ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS 
  rule_id UUID REFERENCES notification_rules(id);

ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS 
  template_id UUID REFERENCES notification_templates(id);

ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS 
  manual_trigger BOOLEAN DEFAULT false;

ALTER TABLE notification_logs ADD COLUMN IF NOT EXISTS 
  triggered_by UUID REFERENCES auth.users(id);

-- Créer la table pour les notifications en attente (mode manuel)
CREATE TABLE IF NOT EXISTS pending_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES notification_rules(id) ON DELETE CASCADE,
  trigger_data JSONB NOT NULL,
  recipient TEXT NOT NULL,
  channel TEXT NOT NULL,
  content TEXT,
  scheduled_for TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'sent')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer les règles par défaut pour les transporteurs
INSERT INTO notification_rules (name, trigger_event, is_active, mode, channels, conditions, template_config)
VALUES 
  (
    'Notification Création Mission',
    'mission_created',
    true,
    'automatic',
    ARRAY['email', 'sms'],
    '{"priority": "high", "roles": ["chauffeur", "exploitant"]}',
    '{"delay_minutes": 0, "retry_count": 3}'
  ),
  (
    'Notification Démarrage Mission',
    'mission_started',
    true,
    'manual',
    ARRAY['email', 'whatsapp'],
    '{"notify_client": true, "notify_exploitant": true}',
    '{"delay_minutes": 5, "retry_count": 2}'
  ),
  (
    'Notification Mission Terminée',
    'mission_completed',
    true,
    'automatic',
    ARRAY['email', 'sms', 'webhook'],
    '{"notify_all_stakeholders": true}',
    '{"delay_minutes": 0, "retry_count": 3}'
  ),
  (
    'Alerte Retard Détecté',
    'delay_detected',
    true,
    'manual',
    ARRAY['sms', 'whatsapp'],
    '{"threshold_minutes": 30, "escalation": true}',
    '{"delay_minutes": 0, "retry_count": 5}'
  ),
  (
    'Notification Incident',
    'incident_reported',
    true,
    'automatic',
    ARRAY['email', 'sms', 'webhook'],
    '{"severity": ["medium", "high", "critical"]}',
    '{"delay_minutes": 0, "retry_count": 3}'
  ),
  (
    'Notification Facture Générée',
    'invoice_generated',
    false,
    'manual',
    ARRAY['email'],
    '{"billing_partners": ["MEDLOG", "MAERSK"]}',
    '{"delay_minutes": 60, "retry_count": 2}'
  )
ON CONFLICT DO NOTHING;

-- Insérer les templates par défaut
INSERT INTO notification_templates (name, event_type, channel, language, subject_template, body_template, variables)
VALUES 
  (
    'Mission Créée - Email FR',
    'mission_created',
    'email',
    'fr',
    'Nouvelle mission {{mission_ref}} assignée',
    'Bonjour {{recipient_name}},\n\nUne nouvelle mission {{mission_ref}} vous a été assignée.\n\nDétails:\n- Client: {{client_name}}\n- Départ: {{pickup_location}}\n- Destination: {{delivery_location}}\n- Date prévue: {{scheduled_date}}\n\nCordialement,\nÉquipe OneLog Africa',
    ARRAY['mission_ref', 'recipient_name', 'client_name', 'pickup_location', 'delivery_location', 'scheduled_date']
  ),
  (
    'Mission Créée - SMS FR',
    'mission_created',
    'sms',
    'fr',
    NULL,
    'Mission {{mission_ref}} assignée. Départ: {{pickup_location}} vers {{delivery_location}} le {{scheduled_date}}. Détails sur l''app OneLog.',
    ARRAY['mission_ref', 'pickup_location', 'delivery_location', 'scheduled_date']
  ),
  (
    'Retard Détecté - WhatsApp FR',
    'delay_detected',
    'whatsapp',
    'fr',
    NULL,
    '⚠️ ALERTE RETARD\nMission {{mission_ref}} en retard de {{delay_minutes}} minutes.\nPosition actuelle: {{current_location}}\nAction requise.',
    ARRAY['mission_ref', 'delay_minutes', 'current_location']
  ),
  (
    'Mission Terminée - Email EN',
    'mission_completed',
    'email',
    'en',
    'Mission {{mission_ref}} completed successfully',
    'Hello {{recipient_name}},\n\nMission {{mission_ref}} has been completed successfully.\n\nDelivery confirmed at {{delivery_time}} to {{delivery_location}}.\n\nThank you,\nOneLog Africa Team',
    ARRAY['mission_ref', 'recipient_name', 'delivery_time', 'delivery_location']
  )
ON CONFLICT DO NOTHING;

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_notification_rules_trigger_active ON notification_rules(trigger_event, is_active);
CREATE INDEX IF NOT EXISTS idx_notification_rules_organization ON notification_rules(organization_id);
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_channel ON notification_templates(event_type, channel);
CREATE INDEX IF NOT EXISTS idx_pending_notifications_status ON pending_notifications(status);
CREATE INDEX IF NOT EXISTS idx_pending_notifications_scheduled ON pending_notifications(scheduled_for) WHERE status = 'approved';

-- Créer les politiques RLS pour la sécurité
ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques pour notification_rules
CREATE POLICY "Users can manage notification rules for their organization" ON notification_rules
  FOR ALL USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT unnest(
        COALESCE(
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_organizations',
          '[]'
        )::text[]
      )::uuid
    )
  );

-- Politiques pour notification_templates
CREATE POLICY "Users can manage notification templates for their organization" ON notification_templates
  FOR ALL USING (
    organization_id IS NULL OR 
    organization_id IN (
      SELECT unnest(
        COALESCE(
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_organizations',
          '[]'
        )::text[]
      )::uuid
    )
  );

-- Politiques pour notification_settings
CREATE POLICY "Users can manage notification settings for their scope" ON notification_settings
  FOR ALL USING (
    (scope = 'user' AND scope_id = auth.uid()) OR
    (scope = 'organization' AND scope_id IN (
      SELECT unnest(
        COALESCE(
          (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_organizations',
          '[]'
        )::text[]
      )::uuid
    )) OR
    (scope = 'global' AND EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin')
    ))
  );

-- Politiques pour pending_notifications
CREATE POLICY "Users can view and manage pending notifications for their organization" ON pending_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM notification_rules nr
      WHERE nr.id = pending_notifications.rule_id
      AND (nr.organization_id IS NULL OR nr.organization_id IN (
        SELECT unnest(
          COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_organizations',
            '[]'
          )::text[]
        )::uuid
      ))
    )
  );

-- Fonction pour traiter les notifications en mode manuel
CREATE OR REPLACE FUNCTION process_manual_notification(
  p_rule_id UUID,
  p_trigger_data JSONB,
  p_recipient TEXT,
  p_channel TEXT
) RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_rule notification_rules%ROWTYPE;
BEGIN
  -- Vérifier que la règle existe et est en mode manuel
  SELECT * INTO v_rule FROM notification_rules WHERE id = p_rule_id AND mode = 'manual' AND is_active = true;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Règle non trouvée ou non en mode manuel';
  END IF;

  -- Créer la notification en attente
  INSERT INTO pending_notifications (
    rule_id,
    trigger_data,
    recipient,
    channel,
    status
  ) VALUES (
    p_rule_id,
    p_trigger_data,
    p_recipient,
    p_channel,
    'pending'
  ) RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour approuver une notification en attente
CREATE OR REPLACE FUNCTION approve_pending_notification(
  p_notification_id UUID,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW()
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_notifications 
  SET 
    status = 'approved',
    approved_by = auth.uid(),
    approved_at = NOW(),
    scheduled_for = p_scheduled_for
  WHERE id = p_notification_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour rejeter une notification en attente
CREATE OR REPLACE FUNCTION reject_pending_notification(
  p_notification_id UUID,
  p_reason TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE pending_notifications 
  SET 
    status = 'rejected',
    approved_by = auth.uid(),
    approved_at = NOW(),
    rejection_reason = p_reason
  WHERE id = p_notification_id AND status = 'pending';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour basculer le mode d'une règle
CREATE OR REPLACE FUNCTION toggle_notification_rule_mode(
  p_rule_id UUID,
  p_new_mode TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notification_rules 
  SET 
    mode = p_new_mode,
    updated_at = NOW()
  WHERE id = p_rule_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger aux tables
DROP TRIGGER IF EXISTS trigger_notification_rules_updated_at ON notification_rules;
CREATE TRIGGER trigger_notification_rules_updated_at
  BEFORE UPDATE ON notification_rules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER trigger_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_notification_settings_updated_at ON notification_settings;
CREATE TRIGGER trigger_notification_settings_updated_at
  BEFORE UPDATE ON notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE notification_rules IS 'Règles de notification personnalisables avec modes automatique/manuel/désactivé';
COMMENT ON TABLE notification_templates IS 'Templates personnalisés pour les notifications par événement et canal';
COMMENT ON TABLE notification_settings IS 'Paramètres globaux et organisationnels pour les notifications';
COMMENT ON TABLE pending_notifications IS 'Notifications en attente d''approbation pour le mode manuel';
