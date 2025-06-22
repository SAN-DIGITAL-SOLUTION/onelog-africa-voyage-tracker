# Checklist Sécurité – Module Affectation Chauffeur

- [ ] **Accès restreint** : Seuls les utilisateurs authentifiés avec rôle "exploitant" peuvent accéder à la page et affecter un chauffeur.
- [ ] **Vérification disponibilité** : Un chauffeur ne peut pas être affecté à deux missions en cours simultanément (contrôle dans le hook et en base).
- [ ] **Validation stricte** : Les actions sont soumises à une vérification du rôle côté front et back.
- [ ] **Protection XSS** : Les champs affichés sont échappés côté front (aucun rendu HTML direct).
- [ ] **Protection injection SQL** : Utilisation des requêtes paramétrées Supabase.
- [ ] **Vérification userId** : L’action d’affectation vérifie que l’utilisateur est bien exploitant (jamais passé par le front).
- [ ] **Logs d’audit** : Chaque affectation est loguée pour traçabilité.
- [ ] **Pas de données sensibles dans l’URL** : Les identifiants sont anonymisés (trackingId, id).
- [ ] **HTTPS obligatoire** : Toutes les requêtes passent par HTTPS (configuration Supabase et front).

---
