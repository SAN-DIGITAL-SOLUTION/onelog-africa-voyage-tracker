-- Seed supplémentaire pour attribuer des rôles précis à des utilisateurs existants (OneLog Africa)

-- Exploiteur
insert into user_roles (user_id, role, role_status)
values ('6323df2e-76e4-4fa8-86b1-8541709749f8', 'exploiteur', 'approved')
on conflict (user_id) do update set role = excluded.role, role_status = excluded.role_status;

-- Admin
insert into user_roles (user_id, role, role_status)
values ('14325933-b5c7-4348-b4ee-5073449db93a', 'admin', 'approved')
on conflict (user_id) do update set role = excluded.role, role_status = excluded.role_status;

-- Chauffeur
insert into user_roles (user_id, role, role_status)
values ('f28ffc66-f668-4752-9f66-c2f734eceb8a', 'chauffeur', 'approved')
on conflict (user_id) do update set role = excluded.role, role_status = excluded.role_status;
