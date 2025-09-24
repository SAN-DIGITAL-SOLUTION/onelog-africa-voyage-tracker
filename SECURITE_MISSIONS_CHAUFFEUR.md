# Checklist Sécurité – Module Missions Chauffeur

- [ ] **Accès restreint** : Seuls les utilisateurs authentifiés avec rôle "chauffeur" peuvent accéder à la page et agir sur les missions.
- [ ] **Vérification d’assignation** : Seul le chauffeur assigné peut agir sur la mission (contrôle front + RLS Supabase).
- [ ] **Validation stricte des statuts** : Impossible de démarrer sans acceptation, terminer sans démarrage, etc.
- [ ] **Protection XSS** : Les champs affichés sont échappés côté front (aucun rendu HTML direct).
- [ ] **Protection injection SQL** : Utilisation des requêtes paramétrées Supabase.
- [ ] **Vérification userId** : Toutes les actions vérifient l’identité Supabase (jamais passé par le front).
- [ ] **Logs d’audit** : Chaque action (acceptation, incident, signature) est loguée pour traçabilité.
- [ ] **Pas de données sensibles dans l’URL** : Les identifiants sont anonymisés (id mission, etc.).
- [ ] **HTTPS obligatoire** : Toutes les requêtes passent par HTTPS (configuration Supabase et front).

---
