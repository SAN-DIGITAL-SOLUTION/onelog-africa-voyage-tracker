-- Profils Utilisateurs
-- Seuls les admins peuvent voir/modifier tous les profils
create policy "Profiles: admins read all" on profiles
  for select using (auth.role() = 'admin');
create policy "Profiles: users read self" on profiles
  for select using (auth.uid() = id);
create policy "Profiles: admins modify all" on profiles
  for update using (auth.role() = 'admin');
create policy "Profiles: users modify self" on profiles
  for update using (auth.uid() = id);

-- Missions
create policy "Missions: admins read all" on missions
  for select using (auth.role() = 'admin');
create policy "Missions: users read own" on missions
  for select using (user_id = auth.uid());
create policy "Missions: admins modify all" on missions
  for update using (auth.role() = 'admin');
create policy "Missions: users modify own" on missions
  for update using (user_id = auth.uid());
