-- fichier : migrations/20250621_rls_tracking_points.sql
ALTER TABLE tracking_points ENABLE ROW LEVEL SECURITY;

-- Seuls chauffeurs et exploitants voient leurs propres points
CREATE POLICY "Tracking: lire points propres"
  ON tracking_points
  FOR SELECT
  USING (
    auth.uid() = user_id OR  -- si user_id est ajouté à chaque point
    EXISTS (
      SELECT 1 FROM missions 
      WHERE id = mission_id 
        AND (auth.uid() = chauffeur_id OR auth.uid() = exploitant_id)
    )
  );
