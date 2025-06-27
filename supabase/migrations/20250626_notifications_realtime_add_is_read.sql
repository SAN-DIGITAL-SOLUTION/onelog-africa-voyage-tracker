-- Migration SQL notifications temps réel (OneLog Africa)
-- Ajoute is_read, index, events pour notifications dashboard

alter table notifications
  add column if not exists is_read boolean not null default false;

-- Index pour filtrage rapide des notifications non lues
create index if not exists idx_notifications_is_read on notifications(is_read);

-- Table déjà existante, mais on vérifie les colonnes clés
alter table notifications
  add column if not exists type text,
  add column if not exists created_at timestamptz default now(),
  add column if not exists summary text,
  add column if not exists user_id uuid;

-- Pour la démo, on force la colonne type (user_created, mission_created, notification_sent, notification_failed, role_changed, error)
