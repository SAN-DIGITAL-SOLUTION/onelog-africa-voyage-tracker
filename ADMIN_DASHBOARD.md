# ADMIN DASHBOARD

## Objectifs
- Supervision des modules critiques (profils, missions, notifications)
- Logs temps réel, indicateurs santé, taux d’envoi
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

## Barre de progression multi-étapes (StepIndicator)

Le composant `<StepIndicator />` est utilisé dans tous les workflows multi-étapes du dashboard (création de mission, notifications, onboarding, etc.).

Exemple :
```tsx
import { StepIndicator } from '@/components/StepIndicator';
const steps = [
  { title: 'Étape 1', completed: true },
  { title: 'Étape 2', completed: false },
];
<StepIndicator steps={steps} />
```

➡️ Voir la doc détaillée dans `INTEGRATION_UI.md`.

## Audit de performance

Pour lancer un audit Lighthouse localement :

```bash
npm install -g @lhci/cli
npm run build
lhci autorun --collect.url=http://localhost:3000/admin/dashboard --upload.target=filesystem --upload.outputDir=lhci-report
```

Vous pouvez aussi utiliser le script npm suivant :

```json
"scripts": {
  "audit:perf": "lhci autorun --collect.url=http://localhost:3000/admin/dashboard --upload.target=filesystem --upload.outputDir=lhci-report"
}
```

Le rapport sera disponible dans le dossier `lhci-report/`.

## Sécurité & conformité
- RLS, logs d’audit, respect préférences utilisateur
- Badges build/coverage/uptime

Voir aussi : `src/modules/adminDashboard/README.md`, `ROADMAP_SUIVI_AUTO.md`, `INTEGRATION_UI.md`
