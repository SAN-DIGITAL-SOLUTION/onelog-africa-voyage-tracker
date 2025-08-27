-- Créer la table positions pour le tracking temps réel
CREATE TABLE IF NOT EXISTS positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id text NOT NULL,
  latitude float8 NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude float8 NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  timestamp timestamptz DEFAULT now()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_positions_vehicle_id ON positions(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_positions_timestamp ON positions(timestamp);

-- Activer Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE positions;

-- Nettoyage automatique des anciennes positions (garder 7 jours)
CREATE OR REPLACE FUNCTION cleanup_old_positions()
RETURNS void AS $$
BEGIN
  DELETE FROM positions WHERE timestamp < now() - interval '7 days';
END;
$$ LANGUAGE plpgsql;

-- Trigger pour nettoyage quotidien
CREATE OR REPLACE FUNCTION trigger_cleanup_positions()
RETURNS trigger AS $$
BEGIN
  PERFORM cleanup_old_positions();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ajouter quelques données de test
INSERT INTO positions (vehicle_id, latitude, longitude) VALUES
  ('truck-1', 5.3560, -4.0083),
  ('truck-2', 5.3600, -4.0100),
  ('truck-3', 5.3500, -4.0050);
