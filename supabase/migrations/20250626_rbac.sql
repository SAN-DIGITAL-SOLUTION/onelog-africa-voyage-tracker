-- RBAC structure and RLS policies for OneLog Africa

-- Roles table
create table if not exists roles (
  id serial primary key,
  name text unique not null
);

-- User roles join table
create table if not exists user_roles (
  user_id uuid references users(id) on delete cascade,
  role text references roles(name) on delete cascade,
  primary key (user_id, role)
);

-- Insert default roles
insert into roles (name) values ('admin'), ('manager'), ('user') on conflict do nothing;

-- RLS policies for users table
alter table users enable row level security;
create policy "Admins can view all users" on users for select using (
  exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
);
create policy "Self can view own user" on users for select using (id = auth.uid());

-- RLS policies for missions table
alter table missions enable row level security;
create policy "Admins can view all missions" on missions for select using (
  exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
);
create policy "Managers can view all missions" on missions for select using (
  exists (select 1 from user_roles where user_id = auth.uid() and role = 'manager')
);
create policy "Self can view own mission" on missions for select using (user_id = auth.uid());

-- RLS policies for notifications table
alter table notifications enable row level security;
create policy "Admins can view all notifications" on notifications for select using (
  exists (select 1 from user_roles where user_id = auth.uid() and role = 'admin')
);
create policy "Self can view own notification" on notifications for select using (user_id = auth.uid());
