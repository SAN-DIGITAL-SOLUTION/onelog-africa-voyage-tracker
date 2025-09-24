# 📌 KANBAN.md — Suivi du projet OneLog Africa

## ✅ LIVRABLES PRÊTS
- Stack Docker Next.js + Postgres + pgAdmin opérationnelle
- Dockerfile multi-stage optimisé
- Build rapide grâce à `.dockerignore` propre
- README clair avec instructions locales
- Fichier `docker-compose.yml` nettoyé (sans version obsolète)
- Supervision automatique des builds par Cascade
- Configuration `.env`, ports, volumes validés
- StepIndicator (barre de progression multi-étapes) industrialisé et intégré (Onboarding, Missions, Notifications)

---

## 🚧 EN COURS
- Bloc Notifications temps réel (Supabase Realtime, dashboard admin dynamique, badge/popup UI, logs live, filtrage RBAC)
- Analyse et débogage du build (résolution conflit `storybook` / `addon-a11y`)
- Correction du `Dockerfile` avec `--legacy-peer-deps` pour contournement temporaire
- Surveillance continue des services Docker (via `docker ps`, `logs`, `healthcheck`)
- Observabilité minimale (préparation des healthchecks)

---

## ✅ LIVRABLES PRÊTS
- Bloc RBAC & Authentification (sécurité, policies RLS, UI, tests unitaires/E2E, doc, badge sécurité validée)

- Migrations SQL & Policies RLS (RBAC/Auth, tables, policies, RLS sur toutes les tables sensibles)

---

## 🔜 PROCHAIN BLOC À PRIORISER

### 🔧 TECH
- [ ] Healthcheck Docker pour les services `app` et `db`
- [ ] CI/CD minimale avec GitHub Actions (build + lint)
- [ ] Dashboard supervision : uptime, erreurs front, statut db
- [ ] Template dashboard monitoring (Uptime Kuma / Prometheus)

### 🧑‍💻 DEV
- [ ] Authentification via JWT + RBAC
- [ ] Module d'onboarding dev (README + script setup)
- [ ] Dashboard admin (gestion utilisateurs, base de données)

### 🚚 MÉTIER
- [ ] Modules métiers (suivi de trajet, planification, alertes)
- [ ] Export CSV / PDF des données
- [ ] Fonctionnalité de reporting mensuel

---

## 💡 IDÉES / EN ATTENTE
- Intégration PWA pour usage mobile offline
- Intégration IA pour suivi automatisé des livraisons
- Multi-tenant (gestion de plusieurs entreprises/logisticiens)
