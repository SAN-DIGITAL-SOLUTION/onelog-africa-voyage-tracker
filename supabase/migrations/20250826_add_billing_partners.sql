-- Migration : Ajout support facturation multi-acteurs (transporteurs MEDLOG/MAERSK)

-- Types énumérés
CREATE TYPE billing_partner_type AS ENUM ('MEDLOG', 'MAERSK', 'CUSTOM');
CREATE TYPE billing_period_type AS ENUM ('weekly', 'biweekly', 'monthly');
CREATE TYPE document_type AS ENUM ('BL', 'CMR', 'EIR', 'INVOICE', 'RECEIPT');

-- Table partenaires de facturation
CREATE TABLE billing_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type billing_partner_type NOT NULL,
  billing_period billing_period_type NOT NULL DEFAULT 'monthly',
  payment_terms integer DEFAULT 30,
  required_documents document_type[] DEFAULT '{BL,CMR,EIR}',
  contact_email text,
  contact_phone text,
  address jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Ajout colonne aux missions
ALTER TABLE missions 
ADD COLUMN billing_partner_id uuid REFERENCES billing_partners(id),
ADD COLUMN billing_status text DEFAULT 'pending',
ADD COLUMN invoice_period_start date,
ADD COLUMN invoice_period_end date;

-- Table factures groupées
CREATE TABLE grouped_invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  billing_partner_id uuid REFERENCES billing_partners(id) NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL,
  total_amount decimal(10,2) NOT NULL,
  document_urls text[],
  status text DEFAULT 'draft',
  created_at timestamp with time zone DEFAULT now(),
  generated_at timestamp with time zone,
  sent_at timestamp with time zone
);

-- Table liaison missions-factures
CREATE TABLE invoice_missions (
  invoice_id uuid REFERENCES grouped_invoices(id),
  mission_id uuid REFERENCES missions(id),
  amount decimal(10,2) NOT NULL,
  PRIMARY KEY (invoice_id, mission_id)
);

-- Index pour performance
CREATE INDEX idx_missions_billing_partner ON missions(billing_partner_id);
CREATE INDEX idx_missions_billing_status ON missions(billing_status);
CREATE INDEX idx_invoices_partner_period ON grouped_invoices(billing_partner_id, period_start, period_end);
CREATE INDEX idx_invoice_missions_mission ON invoice_missions(mission_id);

-- RLS Policies
ALTER TABLE billing_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE grouped_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_missions ENABLE ROW LEVEL SECURITY;

-- Policies pour partenaires
CREATE POLICY "Admins can manage billing partners" ON billing_partners
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view billing partners" ON billing_partners
  FOR SELECT USING (true);

-- Policies pour factures
CREATE POLICY "Admins can manage invoices" ON grouped_invoices
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Billing partners can view their invoices" ON grouped_invoices
  FOR SELECT USING (
    billing_partner_id IN (
      SELECT id FROM billing_partners 
      WHERE contact_email = auth.jwt() ->> 'email'
    )
  );

-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_billing_partners_updated_at BEFORE UPDATE ON billing_partners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Données de test transporteurs
INSERT INTO billing_partners (name, type, billing_period, payment_terms, required_documents, contact_email) VALUES
('MEDLOG Afrique', 'MEDLOG', 'monthly', 30, '{BL,CMR,EIR}', 'billing@medlog.africa'),
('MAERSK Line', 'MAERSK', 'biweekly', 45, '{BL,CMR,EIR,INVOICE}', 'invoices@maersk.com'),
('SMT Africa', 'CUSTOM', 'weekly', 15, '{BL,CMR}', 'compta@smt-africa.com');
