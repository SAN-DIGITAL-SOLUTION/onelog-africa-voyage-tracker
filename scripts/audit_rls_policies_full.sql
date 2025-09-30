-- Audit automatisé des politiques RLS (OneLog Africa)
-- Liste toutes les politiques RLS actives, permissions et tables concernées dans le schéma public

SELECT
  pol.schemaname AS schema,
  pol.tablename AS table,
  pol.policyname AS policy,
  pol.permissive,
  pol.cmd AS command,
  pol.roles,
  pol.qual AS using_expression,
  pol.with_check AS with_check_expression
FROM pg_policies pol
WHERE pol.schemaname = 'public'
ORDER BY pol.tablename, pol.policyname;
