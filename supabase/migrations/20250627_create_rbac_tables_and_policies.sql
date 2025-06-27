-- RBAC & Authentification – OneLog Africa
-- Migration SQL et policies RLS (livraison atomique IA-FIRST)

-- 1. TABLES
create table if not exists roles (
  id serial primary key,
  name text unique not null,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists permissions (
  id serial primary key,
  name text unique not null,
  description text
);

create table if not exists user_roles (
  user_id uuid references users(id) on delete cascade,
  role_id integer references roles(id) on delete cascade,
  assigned_at timestamptz default now(),
  primary key (user_id, role_id)
);

-- 2. RLS : TABLES SENSIBLES
alter table users enable row level security;
alter table missions enable row level security;
alter table notifications enable row level security;
alter table notification_preferences enable row level security;
alter table roles enable row level security;
alter table user_roles enable row level security;
alter table permissions enable row level security;

-- 3. POLICIES
-- USERS
create policy "Admins can manage all users" on users for all using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "User can manage self" on users for all using (
  id = auth.uid()
);

-- MISSIONS
create policy "Admins can manage all missions" on missions for all using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "User can manage own missions" on missions for all using (
  user_id = auth.uid()
);

-- NOTIFICATIONS
create policy "Admins can manage all notifications" on notifications for all using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "User can manage own notifications" on notifications for all using (
  user_id = auth.uid()
);

-- NOTIFICATION_PREFERENCES
create policy "Admins can manage all notification_preferences" on notification_preferences for all using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "User can manage own notification_preferences" on notification_preferences for all using (
  user_id = auth.uid()
);

-- ROLES
create policy "Read roles for all" on roles for select using (true);
create policy "Modify roles only for admin" on roles for insert using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "Modify roles only for admin (update/delete)" on roles for update using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "Modify roles only for admin (delete)" on roles for delete using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);

-- USER_ROLES
create policy "Admins manage user_roles" on user_roles for all using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);

-- PERMISSIONS
create policy "Read permissions for all" on permissions for select using (true);
create policy "Modify permissions only for admin" on permissions for insert using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "Modify permissions only for admin (update/delete)" on permissions for update using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);
create policy "Modify permissions only for admin (delete)" on permissions for delete using (
  exists (select 1 from user_roles ur join roles r on ur.role_id = r.id where ur.user_id = auth.uid() and r.name = 'admin')
);

-- 4. VALEURS PAR DÉFAUT
insert into roles (name, description) values ('admin', 'Administrateur global'), ('manager', 'Gestionnaire'), ('user', 'Utilisateur standard') on conflict (name) do nothing;

-- FIN
