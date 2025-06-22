# 📄 Documentation du module Facturation

## Fonctionnalités principales
- **Affichage des factures** : liste toutes les factures issues de la table Supabase `invoices`.
- **Export PDF/CSV** : exporte la liste affichée au format PDF ou CSV via Supabase Edge Functions.
- **Envoi par email** : envoie une facture par email via Edge Function dédiée.

## Source de données
- Table Supabase : `invoices`
  - Champs principaux attendus : `id`, `date`, `client_name`, `amount`, etc.
  - Requête :
    ```ts
    supabase.from('invoices').select('*').order('date', { ascending: false })
    ```

## Endpoints Edge Functions utilisés
- Génération PDF :
  - URL : `https://fhiegxnqgjlgpbywujzo.functions.supabase.co/export-invoices-pdf`
  - Paramètres : `{ invoices: Invoice[] }` (liste d’objets facture)
- Génération CSV :
  - URL : `https://fhiegxnqgjlgpbywujzo.functions.supabase.co/export-invoices-csv`
  - Paramètres : `{ invoices: Invoice[] }`
- Envoi email :
  - URL : `https://fhiegxnqgjlgpbywujzo.functions.supabase.co/send-invoice-email`
  - Paramètres : `{ invoiceId: string }`

## Instructions de test & débogage local
1. **Affichage** :
   - Lancer l’application, naviguer vers `/invoices`.
   - Les factures sont chargées dynamiquement depuis Supabase.
2. **Export PDF/CSV** :
   - Cliquer sur les boutons « Exporter PDF » ou « Exporter CSV ».
   - Un fichier est téléchargé (vérifier le contenu).
   - En cas d’erreur, vérifier la disponibilité des Edge Functions et la structure des données.
3. **Envoi email** :
   - Cliquer sur « Envoyer » à côté d’une facture.
   - Vérifier le retour de l’API et la réception de l’email (ou logs côté Supabase).
   - En cas d’échec, vérifier les logs Edge Function et la connectivité réseau.

---

*Pour toute modification du schéma de la table `invoices`, adapter les composants et services associés.*
