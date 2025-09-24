-- Audit automatisé des politiques RLS (OneLog Africa)
-- Cette requête retourne toutes les politiques RLS actives sur toutes les tables du schéma public

select
  pol.schemaname as schema,
  pol.tablename as table,
  pol.policyname as policy,
  pol.permissive,
  pol.cmd as command,
  pol.roles,
  pol.qual,
  pol.with_check
from pg_policies pol
where pol.schemaname = 'public'
order by pol.tablename, pol.policyname;
