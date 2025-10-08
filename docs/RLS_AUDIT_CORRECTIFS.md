# Audit et Correctifs RLS – OneLog Africa (MVP)

## 1. Récapitulatif de l’audit RLS (tables critiques)

| Table        | Policies présentes | Vérification auth.uid() | Niveau de permissivité | Action corrective |
|--------------|-------------------|------------------------|-----------------------|------------------|
| missions     | Oui               | Oui                    | Faible                | --               |
| demandes     | Oui               | Oui                    | Faible                | --               |
| tracking     | Oui               | Oui                    | Faible                | --               |
| incidents    | Oui               | Oui                    | Faible                | --               |
| factures     | Oui               | Oui                    | Faible                | --               |

## 2. Correctifs appliqués (exemples)

- Ajout de policies manquantes sur la table `factures` :
  ```sql
  create policy "Clients peuvent lire leurs factures" on factures
    for select using (auth.uid() = client_id);
  ```
- Renforcement des policies sur `missions` :
  ```sql
  create policy "Chauffeur accède à ses missions" on missions
    for select using (auth.uid() = chauffeur_id);
  create policy "Exploitant accède à toutes les missions" on missions
    for select using (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'exploitant'));
  ```
- Vérification que toutes les policies utilisent bien `auth.uid()` et non des conditions permissives.

## 3. Procédure de vérification continue
- Exécution automatique du script d’audit RLS à chaque build CI.
- Correction immédiate de toute permissivité détectée.
- Documentation de chaque correctif dans ce fichier.
