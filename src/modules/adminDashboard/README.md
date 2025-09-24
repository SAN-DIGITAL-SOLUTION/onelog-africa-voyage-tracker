# Module Admin Dashboard

Ce module fournit une interface d’administration centralisée pour :
- Visualiser les modules critiques (profils, missions, notifications)
- Consulter les logs live et indicateurs de santé
- Gérer les cycles de relance (notification retry)
- Accéder à la sécurité (RLS), aux tests (coverage, E2E) et à la CI/CD
- Manipuler utilisateurs, rôles, missions, notifications

## Structure
- Pages Next.js : `/admin/dashboard`, `/admin/logs`, `/admin/notifications`, `/admin/dashboard/metrics`
- Composants UI : DashboardLayout, StatsCard, LogTable, NotificationSummary, RealtimeLogStream, MetricsChart
- Hooks/services : useAdminStats, useLogs, useNotificationsSummary, adminService.ts
- Storybook : stories pour chaque composant
- Tests : unitaires (Vitest), E2E (Cypress)
- Workflow CI/CD dédié : `.github/workflows/dashboard-ci.yml`
- Badges : build, coverage, uptime/API

## Exemple d’utilisation : graphique de métriques

```tsx
import MetricsChart from './components/MetricsChart';

<MetricsChart data={[10, 18, 12, 23, 17, 20, 28]} labels={["2025-06-19", "2025-06-20", "2025-06-21", "2025-06-22", "2025-06-23", "2025-06-24", "2025-06-25"]} title="Notifications envoyées par jour" />
```

## Démarrage
- Installer les dépendances : `npm install`
- Lancer en dev : `npm run dev`
- Tester : `npm run test`, `npx cypress open`

## Sécurité & conformité
- Respect des préférences utilisateur, logs d’audit, accès RLS
- Couverture de tests et CI/CD automatisés

Voir aussi : [ADMIN_DASHBOARD.md](../../ADMIN_DASHBOARD.md), [INTEGRATION_UI.md](../../INTEGRATION_UI.md), [ROADMAP_SUIVI_AUTO.md](../../ROADMAP_SUIVI_AUTO.md)
