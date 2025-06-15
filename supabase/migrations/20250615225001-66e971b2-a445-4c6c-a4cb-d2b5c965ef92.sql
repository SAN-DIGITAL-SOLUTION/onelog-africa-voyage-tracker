
-- Créer la table mission_feedback pour stocker les évaluations
CREATE TABLE public.mission_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mission_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  client_name TEXT,
  client_email TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT mission_feedback_mission_id_fkey FOREIGN KEY (mission_id) REFERENCES public.missions(id) ON DELETE CASCADE
);

-- Activer Row Level Security
ALTER TABLE public.mission_feedback ENABLE ROW LEVEL SECURITY;

-- Politique RLS : permettre la lecture des feedbacks pour le propriétaire de la mission
CREATE POLICY "Mission owner can view feedback"
  ON public.mission_feedback
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.missions 
      WHERE missions.id = mission_feedback.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

-- Politique RLS : permettre l'insertion de feedback (ouvert pour les clients)
CREATE POLICY "Anyone can create feedback"
  ON public.mission_feedback
  FOR INSERT
  WITH CHECK (true);

-- Politique RLS : permettre la mise à jour du feedback par le propriétaire de la mission
CREATE POLICY "Mission owner can update feedback"
  ON public.mission_feedback
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.missions 
      WHERE missions.id = mission_feedback.mission_id 
      AND missions.user_id = auth.uid()
    )
  );

-- Index pour améliorer les performances
CREATE INDEX idx_mission_feedback_mission_id ON public.mission_feedback(mission_id);
CREATE INDEX idx_mission_feedback_created_at ON public.mission_feedback(created_at DESC);
