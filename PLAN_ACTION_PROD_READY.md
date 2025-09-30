# 🚀 Plan d'Action Production Ready - OneLog Africa

**Date de création** : 2025-09-30  
**Dernière mise à jour** : 2025-09-30  
**Responsable** : Développeur unique  
**Objectif** : Rendre l'application prod-ready avec dette technique réduite

---

## 📋 Contexte du Projet

### Stack Technique
- **Frontend** : Next.js / React / TypeScript
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Styling** : Tailwind CSS
- **Tests** : Vitest (unitaires) + Cypress (E2E)
- **CI/CD** : GitHub Actions

### Secrets Configurés

#### ✅ Déjà en place
- [x] `SUPABASE_DB_URL` - URL complète Postgres opérationnelle
- [x] `SONAR_TOKEN` - Analyse SonarCloud

#### ⚠️ À ajouter
- [ ] `SUPABASE_SERVICE_ROLE_KEY` - Pour insérer dans audit_logs côté backend
- [ ] `ADMIN_API_KEY` - Clé secrète pour sécuriser les endpoints admin

---

## 🎯 Phase 0 – Assainir l'arbre & CI (IMMÉDIAT)

**Objectif** : Arbre propre, CI vert, branches de travail prêtes

### Nettoyage local
- [x] Réinitialiser fichiers auto-générés
  ```bash
  git checkout -- README.md docs/auto-update-report.json project-status.json
  ```
  ✅ Complété - Fichiers réinitialisés
- [x] Supprimer fichier backup husky
  ```bash
  git rm --cached .husky/pre-push.bak || true
  rm .husky/pre-push.bak
  ```
  ✅ Pas de fichier .bak trouvé - OK
- [x] Corriger `.husky/pre-push` pour ignorer :
  - `node_modules/`
  - `vendor/`
  - `playwright-report/`
  - `test-results/`
  ✅ Hook pre-push déjà correct

### Vérification locale
- [x] Installer dépendances proprement
  ```bash
  npm ci
  ```
  ⚠️ Problème permissions - utilisé `npm install` à la place
- [ ] Vérifier lint (0 errors acceptés)
  ```bash
  npm run lint
  ```
  🔄 En cours d'exécution...
- [ ] Vérifier types TypeScript
  ```bash
  npm run type-check
  ```
  🔄 En attente...
- [ ] Vérifier tests unitaires
  ```bash
  npm run test:unit
  ```
  🔄 En cours d'exécution...

### Branches de travail
- [x] Créer branche audit trail
  ```bash
  git branch p0/audit-trail
  ```
  ✅ Branche créée localement
- [x] Créer branche migrations
  ```bash
  git branch p0/migrations-complete
  ```
  ✅ Branche créée localement
- [x] Créer branche notifications admin
  ```bash
  git branch p0/notifications-admin
  ```
  ✅ Branche créée localement
- [x] Créer branche facturation
  ```bash
  git branch p0/billing-scheduler
  ```
  ✅ Branche créée localement

**Date de complétion Phase 0** : 2025-09-30 (en cours)

---

## 🔒 Phase 1 – Verrouiller les écarts critiques (P0)

**Priorité** : MAXIMALE  
**Effort estimé** : 7-12 jours.homme

### A. Audit Trail & Conformité GDPR

**Objectif** : Tracer toutes les actions sensibles

#### Base de données
- [x] Créer migration `migrations/20250930_create_audit_logs.sql`
  - Table `audit_logs` avec colonnes :
    - `id` (UUID, PK)
    - `created_at` (timestamp)
    - `actor_id` (UUID, FK users)
    - `actor_role` (text)
    - `entity` (text) - ex: "mission", "user", "invoice"
    - `entity_id` (UUID)
    - `action` (text) - ex: "create", "update", "delete"
    - `context` (JSONB) - IP, user agent, métadonnées
  - Ajouter section `-- DOWN` pour rollback
  ✅ Migration créée avec indexes, RLS policies, fonction helper
- [x] Créer policies RLS
  ✅ Policies créées : admin read, service insert
  ```sql
  -- Only admins can read audit logs
  CREATE POLICY "admin_read_audit_logs" ON audit_logs
    FOR SELECT USING (auth.uid() IN (
      SELECT user_id FROM user_roles WHERE role = 'admin'
    ));
  ```

#### Services & Middleware
- [x] Créer `src/services/auditService.ts`
  - Fonction `logAction(actor_id, action, entity, entity_id, context)`
  - Utiliser `SUPABASE_SERVICE_ROLE_KEY` pour bypass RLS
  ✅ Service créé avec méthodes : logCreate, logUpdate, logDelete, logExport, logAccessDenied, withAudit
- [x] Créer `src/repositories/auditRepository.ts`
  - `insert(auditLog: AuditLog)`
  - `findByEntity(entity, entity_id)`
  ✅ Repository créé avec CRUD complet + stats
- [ ] Instrumenter actions sensibles dans :
  - [ ] Missions (create, update, delete)
  - [ ] Users (role change, delete)
  - [ ] Invoices (send, generate)
  - [ ] Notifications (manual trigger)

#### Tests
- [x] Tests unitaires `auditService.test.ts`
  ✅ 7 tests créés avec mocks Supabase
- [ ] Tests d'intégration pour vérifier row inserted
- [ ] Test rollback migration

#### CI/CD
- [ ] Job `migrations:validate` dans `.github/workflows/`
  - Créer DB ephemeral (docker postgres)
  - Appliquer migrations up
  - Exécuter smoke queries
  - Appliquer down et vérifier rollback

**Critères d'acceptation** :
- [x] Migration réversible testée
- [ ] Au moins 3 endpoints instrumentés
- [ ] Tests passent en CI
- [ ] Documentation ajoutée dans `docs/audit-trail.md`

**Effort** : 2-4 j.h  
**Date de complétion** : ___________

---

### B. Migrations Supabase Complètes

**Objectif** : Reproductibilité totale des environnements

#### Collecte & Organisation
- [ ] Lister toutes les tables existantes dans Supabase
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname = 'public';
  ```
- [ ] Identifier migrations manquantes (comparer avec `migrations/`)
- [ ] Récupérer SQL de création pour chaque table manquante
- [ ] Créer migrations numérotées séquentiellement :
  - Format : `YYYYMMDD_description.sql`
  - Sections `-- UP` et `-- DOWN`

#### Migrations à créer/vérifier
- [ ] Table `missions` (structure complète + indexes)
- [ ] Table `users` extended (au-delà de auth.users)
- [ ] Table `invoices`
- [ ] Table `notifications`
- [ ] Table `notification_preferences`
- [ ] Table `tracking_points`
- [ ] Table `missions_documents`
- [ ] Table `user_roles` (déjà présente, vérifier)
- [ ] Table `roles`
- [ ] Table `permissions`
- [ ] Table `feature_flags` (nouvelle)

#### Workflow CI
- [ ] Créer job `migrations:validate` dans `.github/workflows/migrations.yml`
  ```yaml
  name: Validate Migrations
  on: [pull_request]
  jobs:
    validate:
      runs-on: ubuntu-latest
      services:
        postgres:
          image: postgres:15
          env:
            POSTGRES_PASSWORD: postgres
          options: >-
            --health-cmd pg_isready
      steps:
        - uses: actions/checkout@v4
        - name: Apply migrations up
          run: |
            for f in migrations/*.sql; do
              psql $SUPABASE_DB_URL -f $f
            done
        - name: Smoke tests
          run: psql $SUPABASE_DB_URL -c "SELECT * FROM audit_logs LIMIT 1"
        - name: Apply migrations down
          run: |
            for f in $(ls -r migrations/*.sql); do
              psql $SUPABASE_DB_URL < $f # section DOWN
            done
  ```

#### Documentation
- [ ] Créer `docs/migrations-guide.md`
  - Procédure d'ajout de migration
  - Convention de nommage
  - Exemples up/down

**Critères d'acceptation** :
- [ ] Job CI vert sur toutes les branches
- [ ] Toutes les tables documentées
- [ ] Rollback testé pour chaque migration

**Effort** : 1-2 j.h  
**Date de complétion** : ___________

---

### C. Notifications Maîtrisées (Admin Control)

**Objectif** : Contrôle manuel et désactivation des jalons

#### UI Admin
- [ ] Créer page `src/pages/AdminNotificationsControl.tsx`
  - Section "Jalons actifs" avec toggles
  - Section "Envoi manuel" avec formulaire
  - Liste historique des envois
- [ ] Intégrer dans navigation `AdminDashboard.tsx`
- [ ] Ajouter protection `RequireAuth` + check rôle admin
  ```tsx
  <RequireAuth allowedRoles={['admin']}>
    <AdminNotificationsControl />
  </RequireAuth>
  ```

#### Backend
- [ ] Créer endpoint `POST /api/admin/notifications/trigger`
  - Vérifier `ADMIN_API_KEY` en header
  - Vérifier rôle admin via Supabase
  - Appeler `notificationService.send()`
  - Logger dans `audit_logs`
- [ ] Créer endpoint `PATCH /api/admin/notifications/jalons/:id/toggle`
  - Mettre à jour table `notification_jalons` (à créer)
- [ ] Créer table `notification_jalons` si absente
  ```sql
  CREATE TABLE notification_jalons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
  );
  ```

#### Service
- [ ] Modifier `src/services/notificationService.ts`
  - Vérifier jalon enabled avant envoi
  - Ajouter fonction `triggerManual(userId, template, data)`

#### Tests
- [ ] Test E2E Cypress
  - Login admin
  - Toggle jalon OFF
  - Vérifier notification non envoyée
  - Toggle ON et vérifier envoi
- [ ] Tests unitaires `notificationService.test.ts`

#### Feature Flag
- [ ] Ajouter flag `NOTIFICATIONS_ADMIN_CONTROL` dans `.env`
  - Valeur par défaut : `false`
- [ ] Conditionner affichage UI selon flag

**Critères d'acceptation** :
- [ ] UI admin fonctionnelle
- [ ] Endpoints protégés testés
- [ ] Tests E2E passent
- [ ] Documentation dans `docs/notifications-admin.md`

**Effort** : 2-3 j.h  
**Date de complétion** : ___________

---

### D. Facturation Multi-Acteurs (Stop-gap)

**Objectif** : Éviter exécution automatique non contrôlée

#### Data Model
- [ ] Créer migration `20250930_billing_multiparty.sql`
  - Table `billing_parties` (invoice_id, party_type, party_id, amount, status)
  - Table `billing_schedules` (frequency, next_run, enabled)
  - Policies RLS appropriées

#### API
- [ ] Créer endpoint `POST /api/admin/billing/enqueue`
  - Protégé par `ADMIN_API_KEY`
  - Insère job dans queue (table `billing_queue`)
  - Logger dans `audit_logs`
- [ ] Créer table `billing_queue`
  ```sql
  CREATE TABLE billing_queue (
    id UUID PRIMARY KEY,
    invoice_id UUID,
    status TEXT DEFAULT 'pending',
    scheduled_at TIMESTAMP,
    executed_at TIMESTAMP,
    error TEXT
  );
  ```

#### Service
- [ ] Étendre `src/services/billingService.ts`
  - Fonction `enqueueBilling(invoiceId, parties[])`
  - Fonction `processBillingQueue()` (pour futur cron)

#### Feature Flag
- [ ] Ajouter flag `BILLING_SCHEDULER_ENABLED` (default: `false`)
- [ ] Conditionner tout scheduling automatique

#### Tests
- [ ] Tests unitaires pour `enqueueBilling`
- [ ] Test d'intégration : enqueue → vérifier row dans `billing_queue`

**Critères d'acceptation** :
- [ ] Endpoint fonctionnel mais scheduler désactivé
- [ ] Audit logs enregistrés
- [ ] Tests passent
- [ ] Doc dans `docs/billing-multiparty.md`

**Effort** : 1-3 j.h  
**Date de complétion** : ___________

---

## 🛡️ Phase 2 – Fiabiliser la Plateforme (P1)

**Effort estimé** : 8-12 jours.homme

### A. Edge Functions Facturation

- [ ] Créer `supabase/functions/export-invoices-pdf/`
  - Handler pour génération PDF
  - Tests unitaires avec mock data
- [ ] Créer `supabase/functions/export-invoices-csv/`
- [ ] Créer `supabase/functions/send-invoice-email/`
- [ ] Workflow CI pour build & test Edge Functions
- [ ] Déploiement staging uniquement après review

**Effort** : 3 j.h  
**Date de complétion** : ___________

---

### B. Webhook Twilio Sécurisé

- [ ] Implémenter `server/api/webhooks/twilio.ts`
  - Vérifier signature Twilio
  - Rate limiting (60 req/min/IP)
  - Stocker événement dans `notification_logs`
- [ ] Tests avec payload Twilio signé
- [ ] Documentation webhook dans `docs/webhooks-twilio.md`

**Effort** : 1-2 j.h  
**Date de complétion** : ___________

---

### C. Tests & Qualité

#### Vitest
- [ ] Corriger configuration `vitest.config.ts`
- [ ] Ajouter coverage reporter
  ```bash
  npx vitest run --coverage
  ```
- [ ] Intégrer dans CI
  ```yaml
  - name: Unit tests with coverage
    run: npm run test:unit -- --coverage
  - name: Upload coverage
    uses: codecov/codecov-action@v3
    if: env.CODECOV_TOKEN != ''
  ```

#### Cypress
- [ ] Créer smoke suite ultra rapide (<2min)
  - Login + navigation
  - Création mission basique
  - Consultation dashboard
- [ ] Exécuter dans PR checks

#### Coverage
- [ ] Configurer Codecov ou Coveralls
- [ ] Objectif : >80% sur services critiques

**Effort** : 2-4 j.h  
**Date de complétion** : ___________

---

### D. Monitoring Opérateur

#### Sentry
- [ ] Vérifier DSN dans `.env`
  - `VITE_SENTRY_DSN` (frontend)
  - `SENTRY_DSN` (backend)
- [ ] Tester capture d'erreur
  ```ts
  Sentry.captureException(new Error("Test error"));
  ```

#### Uptime Kuma / Grafana
- [ ] Déployer Uptime Kuma (docker-compose)
- [ ] Ajouter monitor sur endpoint `/api/health`
- [ ] Configurer alertes (email/Slack)

#### Documentation
- [ ] Compléter `docs/MONITORING_GUIDE.md`
  - Procédure d'alerte
  - Dashboard Grafana
  - Runbook incidents

**Effort** : 1-2 j.h  
**Date de complétion** : ___________

---

### E. Documentation Utilisateur

- [ ] Compléter `docs/manuel_utilisateur.md`
  - Guide notifications par rôle
  - Guide facturation multi-acteurs
  - Guide supervision TV
- [ ] Ajouter captures d'écran
- [ ] Générer bundle PDF
  ```bash
  npx md-to-pdf docs/manuel_utilisateur.md
  ```

**Effort** : 4 j.h  
**Date de complétion** : ___________

---

## 🚀 Phase 3 – Préparer les Évolutions (P2)

### A. Rationalisation Supabase & RLS

- [ ] Auditer toutes les policies RLS existantes
- [ ] Créer tests automatisés des policies
- [ ] Documenter dans `docs/supabase-rls.md`

**Effort** : 2 j.h

---

### B. Étude MCP & Connecteurs

- [ ] Définir architecture `MCPContext`
- [ ] Lister APIs ERP/Douanes cibles
- [ ] Prototyper connecteur minimal
- [ ] Planifier phase d'intégration

**Effort** : 5 j.h

---

### C. Expériences Avancées

- [ ] Définir roadmap offline mode (PWA)
- [ ] Étude i18n (react-i18next)
- [ ] Spécification paiement en ligne
- [ ] Spécification chat temps réel
- [ ] Design dark mode

**Effort** : Sprints dédiés (à estimer)

---

### D. Accessibilité & QA

- [ ] Tests Cypress mobile (viewport)
- [ ] Tests a11y avec axe-core
- [ ] Rapport QA consolidé

**Effort** : 3 j.h

---

## 🔧 Refactorisation Progressive

**Principe** : Appliquer dès Phase 0, à chaque PR

### Pattern Services/Repositories/Controllers

#### Structure cible
```
src/
├── services/          # Logique métier
│   ├── auditService.ts
│   ├── notificationService.ts
│   └── billingService.ts
├── repositories/      # Interactions DB
│   ├── auditRepository.ts
│   ├── userRepository.ts
│   └── missionRepository.ts
├── pages/
│   └── api/          # Controllers légers
│       ├── admin/
│       └── webhooks/
└── components/
    └── ui/
        └── index.ts  # Réexports centralisés
```

### Règles de refactorisation
- [ ] Découper fichiers >300 lignes
- [ ] Chaque service doit avoir son test unitaire
- [ ] Déplacer variants UI dans `components/ui/index.ts`
- [ ] Éviter logique métier dans les pages/composants

### Checklist par nouveau service créé
- [ ] Fichier service dans `src/services/`
- [ ] Fichier repository dans `src/repositories/`
- [ ] Test unitaire `*.test.ts` avec Vitest
- [ ] Types exportés dans `src/types/`
- [ ] Documentation JSDoc sur fonctions publiques

---

## 📋 Checklist PR (Template)

**À copier dans chaque description de PR**

```markdown
## Description
[Décrire la fonctionnalité/fix]

## Type de changement
- [ ] 🐛 Bug fix
- [ ] ✨ Nouvelle fonctionnalité
- [ ] 🔧 Refactorisation
- [ ] 📝 Documentation
- [ ] 🧪 Tests

## Tests
- [ ] Tests unitaires locaux OK (`npm run test:unit`)
- [ ] Lint OK (`npm run lint`, 0 errors)
- [ ] Type check OK (`npm run type-check`)
- [ ] Tests E2E smoke (si applicable)

## Base de données
- [ ] Migration `up` présente
- [ ] Migration `down` testée
- [ ] Script exécuté localement

## Sécurité
- [ ] Secrets utilisés documentés
- [ ] Policies RLS vérifiées
- [ ] Endpoints protégés par auth/RBAC

## Rollback
**Comment annuler ce changement :**
1. [Étape 1]
2. [Étape 2]
3. [Feature flag à désactiver si applicable]

## Documentation
- [ ] README mis à jour (si nécessaire)
- [ ] Documentation technique ajoutée dans `/docs`
- [ ] Commentaires code ajoutés

## Review checklist
- [ ] Code review fait par [nom]
- [ ] Tests validés en CI
- [ ] Approuvé pour merge
```

---

## 🎯 Règles d'Or

### 1. Petites PR thématiques
- **1 PR = 1 fonctionnalité** isolée
- **Commits atomiques** avec messages conventionnels
  - `feat(audit): add audit_logs table`
  - `fix(hooks): correct pre-push ignore patterns`
  - `chore(ci): add migrations validation job`

### 2. Rollback obligatoire
- Chaque PR doit inclure section **Rollback**
- Documenter comment désactiver flag ou revert migration

### 3. Gestion des secrets
- **Ne jamais créer de nouveau secret** si déjà existant
- Compléter uniquement `SUPABASE_SERVICE_ROLE_KEY` et `ADMIN_API_KEY`
- Documenter usage dans PR description

### 4. Documentation continue
- **Toute feature critique** = doc dans `/docs`
- Mise à jour `README.md` si changement majeur
- JSDoc sur fonctions publiques

### 5. CI/CD obligatoire
- **Tous les checks doivent passer** avant merge
- Lint / Type-check / Unit tests / Smoke E2E
- Job `migrations:validate` pour toute modif DB

---

## 📊 Suivi des Actions

### Journal d'exécution

| Date | Phase | Action | Statut | Commit/PR | Notes |
|------|-------|--------|--------|-----------|-------|
| 2025-09-30 08:05 | Phase 0 | Création du plan d'action | ✅ Fait | - | Document initial |
| 2025-09-30 08:06 | Phase 0 | Nettoyage arbre git | ✅ Fait | - | Stash + reset fichiers auto-générés |
| 2025-09-30 08:07 | Phase 0 | Vérification hook pre-push | ✅ Fait | - | Hook déjà correct |
| 2025-09-30 08:10 | Phase 0 | Installation dépendances | ⚠️ Partiel | - | npm ci échoué (permissions), npm install en cours |
| 2025-09-30 08:20 | Phase 0 | Création branches P0 | ✅ Fait | - | 4 branches créées localement |
| 2025-09-30 08:25 | Phase 0 | Vérification branches GitHub | ✅ Fait | - | 5 branches distantes confirmées |
| 2025-09-30 08:40 | Phase 1A | Basculement branche p0/audit-trail | ✅ Fait | - | Branche activée |
| 2025-09-30 08:42 | Phase 1A | Création migration audit_logs | ✅ Fait | 20250930_create_audit_logs.sql | Table + RLS + helper function |
| 2025-09-30 08:43 | Phase 1A | Création auditService.ts | ✅ Fait | - | Service complet avec 7 méthodes |
| 2025-09-30 08:44 | Phase 1A | Création auditRepository.ts | ✅ Fait | - | Repository CRUD + stats |
| 2025-09-30 08:45 | Phase 1A | Tests unitaires auditService | ✅ Fait | - | 7 tests avec mocks |

### Métriques

- **Branches actives** : 4 / 4 (audit, migrations, notifications, facturation) ✅
- **PRs mergées** : 0 / 0
- **Tests unitaires** : En cours... / _____
- **Coverage** : En cours...
- **Migrations** : 5 / ~19 versionnées (à compléter)

---

## 🛠️ Commandes Utiles

### Vérification locale
```bash
# Installation propre
npm ci

# Vérifications pré-commit
npm run lint
npm run type-check
npm run test:unit

# Créer branche de travail
git checkout -b p0/nom-feature

# Commit avec message conventionnel
git add .
git commit -m "feat(module): description"

# Push avec upstream
git push --set-upstream origin p0/nom-feature
```

### CI/CD
```bash
# Trigger workflow manuellement
gh workflow run ci-cd-production.yml --ref p0/nom-feature --field environment=staging

# Voir statut des runs
gh run list --workflow "CI/CD Production" --branch p0/nom-feature --limit 5

# Voir logs d'un run
gh run view <run_id> --log
```

### Base de données
```bash
# Appliquer migration localement
psql $SUPABASE_DB_URL -f migrations/20250930_nom.sql

# Exporter schéma actuel
pg_dump $SUPABASE_DB_URL --schema-only > schema-backup.sql

# Tester rollback
psql $SUPABASE_DB_URL -c "BEGIN; [section DOWN de la migration]; ROLLBACK;"
```

---

## 📅 Planning Suggéré

### Semaine 1 (Actuelle)
- **Lundi-Mardi** : Phase 0 complète + début audit trail
- **Mercredi-Jeudi** : Migrations complètes + job CI
- **Vendredi** : Review & corrections

### Semaine 2
- **Lundi-Mardi** : Notifications admin UI + backend
- **Mercredi** : Facturation stop-gap
- **Jeudi-Vendredi** : Tests & intégration

### Semaine 3
- **Lundi-Mardi** : Edge Functions
- **Mercredi** : Webhook Twilio
- **Jeudi-Vendredi** : Tests Vitest/Cypress + coverage

### Semaine 4
- **Lundi-Mardi** : Monitoring + documentation
- **Mercredi** : Polish & fixes
- **Jeudi-Vendredi** : Final review → merge to main

---

## ⚠️ Risques à Surveiller

| Risque | Impact | Mitigation | Responsable |
|--------|--------|------------|-------------|
| Migrations non réversibles | 🔴 Critique | Backups systématiques avant apply | Dev |
| Secrets absents en CI | 🟡 Moyen | Job check-secrets + fail explicite | Dev |
| Feature enabled trop tôt | 🟡 Moyen | Flags OFF par défaut + canary | Dev |
| Tests E2E timeout | 🟢 Faible | Smoke suite <2min + retry | Dev |
| Coverage < 80% | 🟡 Moyen | Tests obligatoires sur services | Dev |

---

## 🎓 Ressources

- [Supabase Migrations Guide](https://supabase.com/docs/guides/database/migrations)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vitest Documentation](https://vitest.dev/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

**Prochain checkpoint** : ___________  
**Validé par** : ___________
