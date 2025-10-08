# Secrets CI/CD requis

Ce document liste les secrets et variables d’environnement à créer dans GitHub (Settings > Secrets and variables > Actions) pour garantir un pipeline stable.

- SECRETS GÉNÉRAUX
  - GITHUB_TOKEN (par défaut GitHub)
  - SLACK_WEBHOOK (notifications déploiements/rollback – ci-cd-production)
  - SLACK_WEBHOOK_URL (notifications d’échec – notify-on-failure/slack-alert)

- ANALYSE & QUALITÉ
  - SONAR_TOKEN (analyse SonarCloud – job code-quality)

- COUVERTURE
  - CODECOV_TOKEN (upload couverture unit/php – ci-cd-production)

- SUPABASE (QA/DEV/PROD)
  - SUPABASE_URL (CI Control Room, QA)
  - SUPABASE_ANON_KEY (CI Control Room, QA)
  - SUPABASE_SERVICE_ROLE_KEY (CI Control Room)
  - SUPABASE_DB_URL_QA (Audit RLS en QA – qa_ci)
  - STAGING_SUPABASE_URL (déploiement staging – ci-cd-production)
  - STAGING_SUPABASE_ANON_KEY (déploiement staging – ci-cd-production)
  - PROD_SUPABASE_URL (déploiement prod – ci-cd-production)
  - PROD_SUPABASE_ANON_KEY (déploiement prod – ci-cd-production)

- SENTRY
  - STAGING_SENTRY_DSN (déploiement staging – ci-cd-production)
  - PROD_SENTRY_DSN (déploiement prod – ci-cd-production)

- NETLIFY (préviews éventuels dans ci.yml)
  - NETLIFY_AUTH_TOKEN
  - NETLIFY_SITE_ID

- MAPBOX
  - MAPBOX_PUBLIC_KEY (CI Control Room / QA / Cypress)

- REGISTRY (Docker GHCR)
  - GITHUB_TOKEN (login automatique, déjà fourni par GitHub)

Notes
- Vérifier l’existence et la validité de tous ces secrets dans chaque environnement (staging/prod via “Environments” GitHub pour gate manuel).
- Les workflows qui utilisent ces secrets: 
  - ci-cd-production.yml (code-quality, unit-tests, php-tests, build, deploy-staging, deploy-production, rollback)
  - ci-control-room.yml (backend-tests, frontend-e2e, health-check)
  - qa_ci.yml (audit-rls, cypress-e2e, vitest-unit)
  - ci.yml (préviews Netlify optionnels)
  - slack-alert.yml / notify-on-failure.yml (notifications)
