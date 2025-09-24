-- Migration pour améliorer la facturation multi-acteurs (MEDLOG/MAERSK)
-- Aligné sur la vision stratégique OneLog Africa - Phase 1 Production Ready

-- Étendre la table billing_partners pour les besoins transporteurs
ALTER TABLE billing_partners ADD COLUMN IF NOT EXISTS 
  billing_config JSONB DEFAULT '{}';

ALTER TABLE billing_partners ADD COLUMN IF NOT EXISTS 
  auto_generation BOOLEAN DEFAULT false;

ALTER TABLE billing_partners ADD COLUMN IF NOT EXISTS 
  notification_settings JSONB DEFAULT '{"email": true, "sms": false, "webhook": false}';

-- Créer la table pour les cycles de facturation automatique
CREATE TABLE IF NOT EXISTS billing_cycles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billing_partner_id UUID REFERENCES billing_partners(id) ON DELETE CASCADE,
  cycle_type TEXT NOT NULL CHECK (cycle_type IN ('weekly', 'biweekly', 'monthly', 'custom')),
  start_day INTEGER DEFAULT 1, -- Jour de début du cycle (1-31 pour mensuel, 1-7 pour hebdomadaire)
  next_generation_date TIMESTAMPTZ NOT NULL,
  last_generation_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Créer la table pour les templates de facturation spécifiques
CREATE TABLE IF NOT EXISTS billing_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billing_partner_id UUID REFERENCES billing_partners(id) ON DELETE CASCADE,
  template_type TEXT NOT NULL CHECK (template_type IN ('invoice', 'summary', 'receipt')),
  template_config JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Améliorer la table grouped_invoices pour le groupage avancé
ALTER TABLE grouped_invoices ADD COLUMN IF NOT EXISTS 
  grouping_criteria JSONB DEFAULT '{"by_client": true, "by_route": false, "by_vehicle": false}';

ALTER TABLE grouped_invoices ADD COLUMN IF NOT EXISTS 
  billing_cycle_id UUID REFERENCES billing_cycles(id);

ALTER TABLE grouped_invoices ADD COLUMN IF NOT EXISTS 
  template_used UUID REFERENCES billing_templates(id);

ALTER TABLE grouped_invoices ADD COLUMN IF NOT EXISTS 
  metadata JSONB DEFAULT '{}';

-- Créer la table pour l'historique des actions de facturation (audit trail)
CREATE TABLE IF NOT EXISTS billing_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES grouped_invoices(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'sent', 'paid', 'cancelled', 'modified')),
  performed_by UUID REFERENCES auth.users(id),
  action_details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insérer des partenaires de facturation par défaut pour MEDLOG et MAERSK
INSERT INTO billing_partners (name, type, billing_period, payment_terms, required_documents, billing_config, auto_generation, notification_settings)
VALUES 
  (
    'MEDLOG',
    'MEDLOG',
    'monthly',
    30,
    ARRAY['BL', 'CMR', 'INVOICE']::text[],
    '{"currency": "XOF", "tax_rate": 0.18, "grouping": {"by_client": true, "by_route": true}}',
    true,
    '{"email": true, "sms": true, "webhook": true, "email_addresses": ["billing@medlog.sn"]}'
  ),
  (
    'MAERSK',
    'MAERSK', 
    'biweekly',
    15,
    ARRAY['BL', 'EIR', 'INVOICE', 'RECEIPT']::text[],
    '{"currency": "USD", "tax_rate": 0.0, "grouping": {"by_client": true, "by_container": true}}',
    true,
    '{"email": true, "sms": false, "webhook": true, "email_addresses": ["finance@maersk.com"]}'
  )
ON CONFLICT (name) DO UPDATE SET
  billing_config = EXCLUDED.billing_config,
  auto_generation = EXCLUDED.auto_generation,
  notification_settings = EXCLUDED.notification_settings;

-- Créer les cycles de facturation automatique
INSERT INTO billing_cycles (billing_partner_id, cycle_type, start_day, next_generation_date)
SELECT 
  bp.id,
  CASE bp.billing_period
    WHEN 'weekly' THEN 'weekly'
    WHEN 'biweekly' THEN 'biweekly'
    WHEN 'monthly' THEN 'monthly'
    ELSE 'monthly'
  END,
  CASE bp.billing_period
    WHEN 'weekly' THEN 1  -- Lundi
    WHEN 'biweekly' THEN 1 -- Premier du mois
    WHEN 'monthly' THEN 1  -- Premier du mois
    ELSE 1
  END,
  CASE bp.billing_period
    WHEN 'weekly' THEN date_trunc('week', NOW()) + INTERVAL '1 week'
    WHEN 'biweekly' THEN date_trunc('month', NOW()) + INTERVAL '2 weeks'
    WHEN 'monthly' THEN date_trunc('month', NOW()) + INTERVAL '1 month'
    ELSE date_trunc('month', NOW()) + INTERVAL '1 month'
  END
FROM billing_partners bp
WHERE bp.auto_generation = true
ON CONFLICT DO NOTHING;

-- Créer les templates par défaut pour MEDLOG et MAERSK
INSERT INTO billing_templates (billing_partner_id, template_type, template_config, is_default)
SELECT 
  bp.id,
  'invoice',
  CASE bp.type
    WHEN 'MEDLOG' THEN '{"format": "A4", "language": "fr", "logo": "medlog_logo.png", "footer": "MEDLOG - Transport et Logistique"}'
    WHEN 'MAERSK' THEN '{"format": "A4", "language": "en", "logo": "maersk_logo.png", "footer": "MAERSK - Global Container Logistics"}'
    ELSE '{}'
  END::jsonb,
  true
FROM billing_partners bp
WHERE bp.type IN ('MEDLOG', 'MAERSK')
ON CONFLICT DO NOTHING;

-- Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_billing_cycles_partner_active ON billing_cycles(billing_partner_id, is_active);
CREATE INDEX IF NOT EXISTS idx_billing_cycles_next_generation ON billing_cycles(next_generation_date) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_grouped_invoices_cycle ON grouped_invoices(billing_cycle_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_log_invoice ON billing_audit_log(invoice_id);
CREATE INDEX IF NOT EXISTS idx_billing_audit_log_created_at ON billing_audit_log(created_at);

-- Créer les politiques RLS pour la sécurité
ALTER TABLE billing_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_audit_log ENABLE ROW LEVEL SECURITY;

-- Politique pour billing_cycles
CREATE POLICY "Users can view billing cycles for their organization" ON billing_cycles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM billing_partners bp
      WHERE bp.id = billing_cycles.billing_partner_id
      AND bp.id IN (
        SELECT unnest(
          COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_partners',
            '[]'
          )::text[]
        )::uuid
      )
    )
  );

-- Politique pour billing_templates
CREATE POLICY "Users can manage billing templates for their organization" ON billing_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM billing_partners bp
      WHERE bp.id = billing_templates.billing_partner_id
      AND bp.id IN (
        SELECT unnest(
          COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_partners',
            '[]'
          )::text[]
        )::uuid
      )
    )
  );

-- Politique pour billing_audit_log
CREATE POLICY "Users can view audit logs for their invoices" ON billing_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM grouped_invoices gi
      JOIN billing_partners bp ON gi.billing_partner_id = bp.id
      WHERE gi.id = billing_audit_log.invoice_id
      AND bp.id IN (
        SELECT unnest(
          COALESCE(
            (auth.jwt() ->> 'user_metadata')::jsonb ->> 'accessible_partners',
            '[]'
          )::text[]
        )::uuid
      )
    )
  );

-- Fonction pour calculer la prochaine date de génération
CREATE OR REPLACE FUNCTION calculate_next_billing_date(
  cycle_type TEXT,
  start_day INTEGER,
  last_date TIMESTAMPTZ DEFAULT NOW()
) RETURNS TIMESTAMPTZ AS $$
BEGIN
  CASE cycle_type
    WHEN 'weekly' THEN
      RETURN date_trunc('week', last_date) + INTERVAL '1 week' + (start_day - 1) * INTERVAL '1 day';
    WHEN 'biweekly' THEN
      RETURN date_trunc('week', last_date) + INTERVAL '2 weeks' + (start_day - 1) * INTERVAL '1 day';
    WHEN 'monthly' THEN
      RETURN date_trunc('month', last_date) + INTERVAL '1 month' + (start_day - 1) * INTERVAL '1 day';
    ELSE
      RETURN last_date + INTERVAL '1 month';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour automatiquement les cycles après génération
CREATE OR REPLACE FUNCTION update_billing_cycle_after_generation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.billing_cycle_id IS NOT NULL THEN
    UPDATE billing_cycles 
    SET 
      last_generation_date = NOW(),
      next_generation_date = calculate_next_billing_date(cycle_type, start_day, NOW()),
      updated_at = NOW()
    WHERE id = NEW.billing_cycle_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour mettre à jour les cycles
DROP TRIGGER IF EXISTS trigger_update_billing_cycle ON grouped_invoices;
CREATE TRIGGER trigger_update_billing_cycle
  AFTER INSERT ON grouped_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_billing_cycle_after_generation();

-- Fonction pour logger les actions de facturation
CREATE OR REPLACE FUNCTION log_billing_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO billing_audit_log (
    invoice_id,
    action_type,
    performed_by,
    action_details,
    ip_address
  ) VALUES (
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'created'
      WHEN TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN NEW.status::text
      WHEN TG_OP = 'DELETE' THEN 'cancelled'
      ELSE 'modified'
    END,
    auth.uid(),
    jsonb_build_object(
      'operation', TG_OP,
      'old_values', CASE WHEN TG_OP != 'INSERT' THEN row_to_json(OLD) ELSE NULL END,
      'new_values', CASE WHEN TG_OP != 'DELETE' THEN row_to_json(NEW) ELSE NULL END
    ),
    inet_client_addr()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour l'audit trail
DROP TRIGGER IF EXISTS trigger_billing_audit_log ON grouped_invoices;
CREATE TRIGGER trigger_billing_audit_log
  AFTER INSERT OR UPDATE OR DELETE ON grouped_invoices
  FOR EACH ROW
  EXECUTE FUNCTION log_billing_action();

COMMENT ON TABLE billing_cycles IS 'Gestion des cycles de facturation automatique pour les partenaires';
COMMENT ON TABLE billing_templates IS 'Templates personnalisés pour la génération de factures par partenaire';
COMMENT ON TABLE billing_audit_log IS 'Journal d''audit pour toutes les actions de facturation (compliance GDPR)';
