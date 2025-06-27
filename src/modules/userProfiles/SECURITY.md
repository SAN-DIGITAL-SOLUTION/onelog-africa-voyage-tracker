# Sécurité – Module Profils Utilisateurs

- Rôles gérés côté base et API (admin, opérateur, client)
- Endpoints sensibles protégés (authentification requise)
- Jamais de mot de passe en clair
- Permissions vérifiées côté service et API (ex : seul admin peut changer un rôle)
- Audit npm/CodeQL automatisé (voir workflow CI)
