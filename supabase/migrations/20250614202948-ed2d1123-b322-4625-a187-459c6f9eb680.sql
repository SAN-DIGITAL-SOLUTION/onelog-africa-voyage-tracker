
-- Créez un bucket de stockage public pour les factures
insert into storage.buckets (id, name, public)
values ('invoices', 'invoices', true);

-- Donnez TOUS les droits à tous les utilisateurs authentifiés sur les fichiers du bucket "invoices"
-- policy: lecture/écriture/suppression si user connecté (vous pouvez ajuster si besoin plus tard)
-- Lecture
create policy "Users can read their invoices files"
  on storage.objects
  for select
  using (
    bucket_id = 'invoices' AND auth.role() = 'authenticated'
  );

-- Insertion (écriture)
create policy "Users can upload invoices files"
  on storage.objects
  for insert
  with check (
    bucket_id = 'invoices' AND auth.role() = 'authenticated'
  );

-- Suppression
create policy "Users can delete invoices files"
  on storage.objects
  for delete
  using (
    bucket_id = 'invoices' AND auth.role() = 'authenticated'
  );

-- Mise à jour
create policy "Users can update invoices files"
  on storage.objects
  for update
  using (
    bucket_id = 'invoices' AND auth.role() = 'authenticated'
  );
