-- Script d’audit RLS pour Supabase OneLog Africa
-- Liste les policies actives sur les tables critiques
SELECT table_name, policy_name, definition, command, roles
FROM pg_policies
WHERE table_name IN ('missions', 'demandes', 'tracking', 'incidents', 'factures');

-- Exemple de vérification stricte (à adapter selon vos policies)
-- SELECT * FROM pg_policies WHERE definition NOT LIKE '%auth.uid()%';
