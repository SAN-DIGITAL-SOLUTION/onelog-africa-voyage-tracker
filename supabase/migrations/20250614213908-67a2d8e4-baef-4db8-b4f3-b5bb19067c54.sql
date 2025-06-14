
-- Table de logs d'email liés aux factures/expéditions
CREATE TABLE public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL,
  email_to TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL,         -- 'success' ou 'error'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Activer la RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Seul l'utilisateur connecté peut ajouter/voir ses logs
CREATE POLICY "seul utilisateur peut voir ses logs email"
  ON public.email_logs FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "seul utilisateur peut ajouter un log email"
  ON public.email_logs FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Optionnel : seul l'utilisateur propriétaire peut voir/modifier supprimer ses logs (extension si besoin)
CREATE POLICY "seul utilisateur peut supprimer ses logs email"
  ON public.email_logs FOR DELETE
  USING (user_id = auth.uid());
