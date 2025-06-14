
-- Restreindre la suppression dans le bucket invoices : interdit à tous sauf rôles 'service_role' (admin technique)
-- D'abord on supprime la règle trop permissive si existante
DROP POLICY IF EXISTS "Users can delete invoices files" ON storage.objects;

-- Autoriser la suppression SEULEMENT si le rôle est 'service_role'
CREATE POLICY "Only service_role can delete invoices files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'invoices' AND
    (auth.role() = 'service_role')
  );

-- [Optionnel] Vous pouvez créer une “retenue” par cron plus tard, mais voici comment ajouter une colonne 'expires_at' si besoin :
-- ALTER TABLE invoices ADD COLUMN expires_at timestamp with time zone;

-- [Facultatif] Préparer une policy pour lecture/écriture si besoin plus restrictif :
-- (par défaut, la lecture/écriture existe uniquement pour authenticated users via vos policies déjà en place)
