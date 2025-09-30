-- fichier : policies/rls_missions.sql (ajout de cette règle)
CREATE POLICY "Chauffeurs: modifier leur statut check-in/out"
  ON missions
  FOR UPDATE
  USING (auth.uid() = chauffeur_id AND user_role = 'chauffeur');
