# Checklist Sécurité – Module Création de Demande Client

- [ ] **Accès restreint** : Seuls les utilisateurs authentifiés avec rôle "client" peuvent accéder à la page et créer une demande.
- [ ] **Validation stricte** : Tous les champs obligatoires sont validés côté front et back (type, volume, date, contact).
- [ ] **Protection XSS** : Les champs texte sont échappés côté front et back (aucun rendu HTML direct).
- [ ] **Protection injection SQL** : Utilisation des requêtes paramétrées Supabase (pas de concaténation de requêtes).
- [ ] **Vérification userId** : Le userId inséré en base correspond à l’utilisateur authentifié Supabase (jamais passé par le front).
- [ ] **Génération trackingId** : Le trackingId est généré côté serveur/front avec UUID (unicité assurée).
- [ ] **Limite de fréquence** : Implémenter un anti-spam (limiter le nombre de demandes par utilisateur/heure si besoin).
- [ ] **Logs d’erreur** : Les erreurs sont loguées côté serveur pour analyse.
- [ ] **Pas de données sensibles dans l’URL** : Le trackingId est alphanumérique, aucune info privée dans l’URL.
- [ ] **HTTPS obligatoire** : Toutes les requêtes passent par HTTPS (configuration Supabase et front).

---
