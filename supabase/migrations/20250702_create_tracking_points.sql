-- Migration : Table tracking_points pour le suivi live chauffeur
CREATE TABLE IF NOT EXISTS tracking_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id uuid REFERENCES missions(id) ON DELETE CASCADE,
  chauffeur_id uuid REFERENCES users(id),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  recorded_at timestamptz DEFAULT now()
);

-- Politique RLS : accès uniquement à ses propres points
ALTER TABLE tracking_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chauffeurs: accès à leurs points de tracking"
  ON tracking_points
  FOR SELECT
  USING (auth.uid() = chauffeur_id);

CREATE POLICY "Chauffeurs: insertion de points"
  ON tracking_points
  FOR INSERT
  WITH CHECK (auth.uid() = chauffeur_id);
