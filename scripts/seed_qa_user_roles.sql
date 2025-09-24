-- Script de seed QA pour user_roles et profils utilisateurs (OneLog Africa)
-- Crée différents cas pour tester la modération des rôles

-- Utilisateur sans rôle
insert into profiles (id, email, role, name) values
  ('user-norole-uuid', 'norole@qa.test', null, 'No Role QA')
on conflict (id) do nothing;

insert into user_roles (user_id, role, role_status)
values ('user-norole-uuid', null, null)
on conflict (user_id) do nothing;

-- Utilisateur en pending (hybrid)
insert into profiles (id, email, role, name) values
  ('user-pending-uuid', 'pending@qa.test', null, 'Pending QA')
on conflict (id) do nothing;

insert into user_roles (user_id, requested_role, role_status)
values ('user-pending-uuid', 'client', 'pending')
on conflict (user_id) do nothing;

-- Utilisateur validé automatiquement (self_service)
insert into profiles (id, email, role, name) values
  ('user-self-uuid', 'self@qa.test', 'chauffeur', 'Self Service QA')
on conflict (id) do nothing;

insert into user_roles (user_id, role, role_status)
values ('user-self-uuid', 'chauffeur', 'approved')
on conflict (user_id) do nothing;

-- Admin pour la modération
delete from profiles where id = 'admin-uuid';
delete from user_roles where user_id = 'admin-uuid';
insert into profiles (id, email, role, name) values
  ('admin-uuid', 'admin@qa.test', 'admin', 'Admin QA')
on conflict (id) do nothing;
