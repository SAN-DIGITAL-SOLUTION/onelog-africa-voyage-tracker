# Tableau de Bord Administrateur – OneLog Africa

## Objectifs
- Supervision des modules critiques (profils, missions, notifications)
- Logs temps réel, indicateurs santé, taux d'envoi
- Gestion des relances et notifications
- Sécurité, tests, CI/CD, audit

## Fonctionnalités
- Vue globale, logs, notifications
- Analytics avancés : courbes utilisateurs/missions, exports CSV, filtres date
- Tableaux, graphes, filtres, live
- Gestion des rôles (RBAC) : UI attribution, protection routes admin, RLS
- Intégration Supabase Realtime
- Tests unitaires (Vitest) et E2E (Cypress)
- Livraison en bloc (commit atomique IA-FIRST)

## Structure technique
- Next.js, composants UI réutilisables
- Hooks, services, tests, stories, CI/CD

## Sécurité & RBAC

**Bloc RBAC & Authentification clôturé :**
- Sécurité renforcée (RLS, policies Supabase, protection SSR/middleware)
- UI d'administration des rôles, gestion dynamique
- Tests unitaires (Vitest) & E2E (Cypress) ≥ 90% couverture
- Documentation et badge "Sécurité validée"
- Prêt pour audit, onboarding ou extension future

Toutes les routes `/admin/*` sont protégées par un middleware et SSR. Seuls les utilisateurs avec le rôle `admin` peuvent accéder à ces pages.

## Barre de progression multi-étapes (StepIndicator)

Le composant `<StepIndicator />` est utilisé dans tous les workflows multi-étapes du dashboard (création de mission, notifications, onboarding, etc.).

Exemple :
```tsx
import { StepIndicator } from '@/components/StepIndicator';
const steps = [
  { title: 'Étape 1', completed: true },
  { title: 'Étape 2', completed: false },
];
<StepIndicator steps={steps} />
```

## Tests E2E

- [RBAC/Auth admin (protection, modale, changement de rôle)](../../cypress/e2e/rbac-auth.spec.ts)

Ce test vérifie :
- Redirection vers `/login` si non-admin ou JWT invalide
- Accès admin OK et présence de la modale UserRolesModal
- Changement de rôle admin/user en temps réel

Pour exécuter tous les tests E2E :
```bash
npm run test:e2e
```

## Audit de performance

Pour lancer un audit Lighthouse localement :

```bash
npm install -g @lhci/cli
npm run build
lhci autorun --collect.url=http://localhost:3000/admin/dashboard --upload.target=filesystem --upload.outputDir=lhci-report
```

## Documentation associée
- [Guide d'intégration UI](INTEGRATION_UI.md)
- [Documentation de sécurité](SECURITY.md)
- [Guide de test E2E](../../cypress/README.md)

## Prochaines étapes
- Enrichissement fonctionnel (analytics, gestion utilisateurs, logs)
- Extension des modules métier
- Amélioration continue de la sécurité et des performances
