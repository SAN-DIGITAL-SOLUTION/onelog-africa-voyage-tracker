
-- Table des missions
CREATE TABLE public.missions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  ref TEXT NOT NULL,
  client TEXT NOT NULL,
  chauffeur TEXT,
  date DATE NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table des factures
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mission_ref TEXT,
  number TEXT NOT NULL,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table des notifications
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL,        -- "email" ou "sms"
  target TEXT NOT NULL,      -- adresse mail ou numéro de tél
  message TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT now()
);

-- Activer Row Level Security
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politique RLS : voir les siennes
CREATE POLICY "Seul l'utilisateur connecté voit ses missions"
  ON public.missions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Seul l'utilisateur connecté peut ajouter une mission"
  ON public.missions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Seul l'utilisateur connecté voit ses factures"
  ON public.invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Seul l'utilisateur connecté peut ajouter une facture"
  ON public.invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Seul l'utilisateur connecté voit ses notifications"
  ON public.notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Seul l'utilisateur connecté peut ajouter une notification"
  ON public.notifications
  FOR INSERT WITH CHECK (user_id = auth.uid());
