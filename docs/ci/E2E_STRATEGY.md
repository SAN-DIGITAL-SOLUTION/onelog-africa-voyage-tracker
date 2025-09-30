# Stratégie E2E – Cypress vs Playwright

Décision: conserver Cypress pour les smoke-tests rapides et utiliser Playwright pour les parcours critiques et la validation de release.

- Cypress (smoke-tests)
  - Objectif: feedback très rapide sur les parcours essentiels (auth, dashboards, navigation).
  - Workflows: `.github/workflows/e2e-ci.yml` (fast-tests/full-tests), `qa_ci.yml` (Cypress E2E Tests (Smoke)), `ci-control-room.yml` (Cypress headless).
  - Exécution: headless, sur `vite dev` (port 5173), reporter mochawesome (fusionné et artifact HTML si besoin).

- Playwright (parcours critiques / pipeline prod)
  - Objectif: robustesse, traces/vidéos, exécution déterministe.
  - Workflows: `.github/workflows/ci-cd-production.yml` (job `e2e-tests`).
  - Exécution: `playwright.config.ts` (webServer Vite 5174, retries en CI, traces/vidéos, outputDir `test-results`).

Bonnes pratiques
- Éviter les doublons: scénarios identiques ne doivent pas figurer dans les deux stacks.
- Smoke Cypress ≤ 5 minutes; Playwright complet peut prendre plus (avec retries/documents).
- Reporter couverture: unit tests (Vitest) produisent `coverage/lcov.info` (Codecov/Coveralls). Les E2E ne contribuent pas à la couverture.
- Artifacts: Cypress (screenshots/vidéos en échec), Playwright (traces/vidéos au premier échec).

Évolution possible
- Standardiser entièrement sur Playwright si la maintenance multi-stack devient coûteuse. Dans ce cas, marquer `e2e-ci.yml` comme deprecated et migrer les smoke-tests vers des projets Playwright ciblés.
