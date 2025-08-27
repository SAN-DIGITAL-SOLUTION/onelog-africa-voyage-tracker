-- Table positions pour la salle de contrôle transporteurs
CREATE TABLE IF NOT EXISTS positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicule_id VARCHAR(50) NOT NULL,
  mission_id VARCHAR(50) NOT NULL,
  transporteur_id UUID NOT NULL REFERENCES auth.users(id),
  statut VARCHAR(20) NOT NULL CHECK (statut IN ('en_route', 'en_attente', 'livre', 'retour')),
  latitude DECIMAL(10,8) NOT NULL,
  longitude DECIMAL(11,8) NOT NULL,
  vitesse INTEGER DEFAULT 0,
  direction INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_positions_vehicule ON positions(vehicule_id);
CREATE INDEX IF NOT EXISTS idx_positions_mission ON positions(mission_id);
CREATE INDEX IF NOT EXISTS idx_positions_transporteur ON positions(transporteur_id);
CREATE INDEX IF NOT EXISTS idx_positions_timestamp ON positions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_positions_statut ON positions(statut);

-- RLS - Chaque transporteur ne voit que ses véhicules
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;

-- Politique pour les transporteurs (lecture de leurs propres véhicules)
CREATE POLICY "Transporteurs voient leurs positions" ON positions
  FOR SELECT USING (
    transporteur_id = auth.uid()
  );

-- Politique pour les transporteurs (insertion de positions)
CREATE POLICY "Transporteurs peuvent insérer positions" ON positions
  FOR INSERT WITH CHECK (
    transporteur_id = auth.uid()
  );

-- Politique pour les transporteurs (mise à jour de leurs positions)
CREATE POLICY "Transporteurs peuvent mettre à jour positions" ON positions
  FOR UPDATE USING (
    transporteur_id = auth.uid()
  );

-- Fonction pour obtenir la dernière position par véhicule
CREATE OR REPLACE FUNCTION get_latest_positions(transporteur_uuid UUID)
RETURNS TABLE (
  vehicule_id VARCHAR,
  mission_id VARCHAR,
  statut VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  vitesse INTEGER,
  direction INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (p.vehicule_id)
    p.vehicule_id,
    p.mission_id,
    p.statut,
    p.latitude,
    p.longitude,
    p.vitesse,
    p.direction,
    p.timestamp
  FROM positions p
  WHERE p.transporteur_id = transporteur_uuid
  ORDER BY p.vehicule_id, p.timestamp DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_positions_updated_at
  BEFORE UPDATE ON positions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
