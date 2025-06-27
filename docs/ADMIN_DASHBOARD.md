# Admin Dashboard – OneLog Africa

## Sécurité & RBAC

**Bloc RBAC & Authentification clôturé :**
- Sécurité renforcée (RLS, policies Supabase, protection SSR/middleware)
- UI d’administration des rôles, gestion dynamique
- Tests unitaires (Vitest) & E2E (Cypress) ≥ 90% couverture
- Documentation et badge “Sécurité validée”
- Prêt pour audit, onboarding ou extension future

Toutes les routes `/admin/*` sont protégées par un middleware et SSR (voir code source). Seuls les utilisateurs avec le rôle `admin` peuvent accéder à ces pages.

## Tests E2E

- [RBAC/Auth admin (protection, modale, changement de rôle)](../../cypress/e2e/rbac-auth.spec.ts)

Ce test vérifie :
- Redirection vers `/login` si non-admin ou JWT invalide
- Accès admin OK et présence de la modale UserRolesModal
- Changement de rôle admin/user en temps réel

Pour exécuter tous les tests E2E :
```bash
npm run test:e2e
```
