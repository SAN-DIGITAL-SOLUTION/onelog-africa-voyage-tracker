# Guide d’Implémentation et Stratégie Hybride – OneLog Africa Voyage Tracker

## 🎯 Objectif

Un guide unique combinant :

1. L’**architecture & intégration** des nouvelles fonctionnalités dans l’existant.
2. Le **découpage en phases** et la **stratégie hybride Map‑First + Card‑First**.
3. Les **spécifications clés**, la **stratégie de tests**, et la **planification Dev/QA/CI‑CD**.

---

## 1. Architecture & Stratégie d’Intégration

### 1.1 Schéma de Base de Données

```sql
-- Étendre la table missions
ALTER TABLE missions ADD COLUMN billing_cycle TEXT;
ALTER TABLE missions ADD COLUMN third_party_id UUID REFERENCES third_parties(id);

-- Nouvelle table tiers payeurs
CREATE TABLE third_parties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT,
  contact_info JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 1.2 Points d’Intégration Techniques

* **API** : nouvelles routes sous `/api/v2/` (billing, supervision, notifications).
* **Auth** : utilisation du système Supabase Auth existant.
* **Events** : bus d’événements pour synchronisation en temps réel.

### 1.3 Composants & Services

```text
src/
  services/
    BillingService.ts          # Cycle périodique, tiers payeurs
    SupervisionService.ts      # WebSocket + Supabase Realtime
    NotificationWorkflowService.ts  # Validation manuelle
  components/
    billing/
      BillingCycleForm.tsx
      ThirdPartyManager.tsx
    supervision/
      MapView.tsx
      VehicleList.tsx
    notifications/
      NotificationControl.tsx
```

### 1.4 Stratégie de Déploiement & Branches Git

1. **Préparation** (1 sem) : migrations BDD, création de `feature/schema`.
2. **Backend** (2 sem) : implémentation services, tests intégration.
3. **Frontend** (3 sem) : développement UI, tests utilisateurs.

Branches :

```
feature/supervision-mvp
feature/billing-periodic
feature/billing-advanced
feature/notifications-control
```

---

## 2. Approche Hybride & Découpage en Phases

| Phase                             | Durée        | Contenu Clé                                              |
| --------------------------------- | ------------ | -------------------------------------------------------- |
| **0. UX**                         | 1 semaine    | Revue interne UX (Map‑First, Card‑First, Timeline‑First) |
| **1. Supervision MVP**            | 2–3 semaines | Carte temps réel full‑screen + sidebar filtres/KPI       |
| **2. Cards Dashboard**            | 1–2 semaines | Grille modular Dashboard (missions, factures, notif)     |
| **3a. Facturation Périodique**    | 1–2 semaines | Tiers payeurs + planificateur périodique                 |
| **3b. Facturation Avancée**       | 2 semaines   | Upload justificatifs, archivage, relances                |
| **4. Notifications Contrôlables** | 2–3 semaines | Workflow manuel/auto, templates dynamiques               |
| **5. QA & Automatisation**        | 1 semaine    | Tests unitaires, E2E, smoke tests CI                     |
| **6. Roll‑out**                   | 1 semaine    | Canary → staging → prod, monitoring, feedback            |

---

## 3. Spécifications API & Data Flows

### 3.1 Endpoints clés

| Route                      | Méthode | Description                               |
| -------------------------- | ------- | ----------------------------------------- |
| `/api/v2/supervision`      | GET     | Positions des véhicules en temps réel     |
| `/api/v2/billing`          | POST    | Générer facture périodique                |
| `/api/v2/billing/advanced` | POST    | Générer facture avec documents            |
| `/api/v2/notifications`    | POST    | Envoyer notification manuelle/automatique |

### 3.2 Flux de Données

1. **Frontend** envoie requête → **Supabase Edge Function** → BDD
2. **Realtime** : WebSocket Supabase → composants MapView
3. **Batch Billing** : scheduler Edge Function → stockage PDF → envoi email

---

## 4. Tests, QA & CI/CD

* **Unitaires** (Vitest) : couverture ≥ 80% sur services et hooks
* **E2E** (Playwright / Cypress) : flows critiques (supervision, billing, notif)
* **Smoke tests CI** : présence carte, cards, header/sidebar
* **Pipeline** : lint → build → tests → smoke → déploiement canary

---

## 5. Monitoring & Sécurité

* **RLS Policies** documentées pour chaque table (missions, invoices, third\_parties)
* **Gestion des secrets** via variables d’environnement et rotation régulière
* **Monitoring** : logs Supabase, Sentry, alertes PagerDuty

---

## 6. Migration & Rollback

### 6.1 Scripts de migration

```js
// scripts/migrations/add-billing.js
async function up() { /* ALTER TABLE... */ }
async function down() { /* DROP COLUMN... */ }
```

### 6.2 Plan de Rollback

1. Restaurer BDD via backup
2. Revenir à la version précédente du frontend
3. Vérifier intégrité et logs

---

## 7. Suivi & Indicateurs

* **project-status.json** : mise à jour automatique à la fin de chaque phase (champ `currentPhase`, `completionPercent`, `nextDeliverable`).
* **roadmap.md** : checklist par phase, cases à cocher validées dans GitHub (issues ou PR link).
* **Tags Git** : chaque fin de phase utilise un tag sémantique, ex. `v1.0.0-supervision-mvp`, `v1.0.0-cards-dashboard`, etc.
* **Checklists de validation** : dans `docs/QA-checklist-{phase}.md`, signature du responsable QA et date de validation.
* **Réunions hebdo** : revue d’avancement et mise à jour du plan si nécessaire.

---

## 8. Marquage des Phases et Validation

1. **Début de phase** : créer une issue GitHub nommée `Phase X – <Nom de la phase>` et assigner l’équipe.
2. **Suivi quotidien** : mettre à jour `project-status.json` et `roadmap.md` avec l’avancement (cases cochées).
3. **Livrable de phase** : à la fin de la phase, ouvrir une Pull Request `feat(phase-x): completion of <Nom de la phase>` ciblant la branche `main`.
4. **Validation QA** : exécuter la checklist dans `docs/QA-checklist-phase-x.md`, ajouter une section `✅ Validé par : <Nom> – <Date>`.
5. **Tagging** : après merge, créer un tag Git `vx.y.z-<phase>` et pousser vers le dépôt.
6. **Communication** : notifier l’équipe via Slack/Email avec le changelog et le tag.

---

**Le respect de ce suivi garantit que Cascade gère correctement l’exécution des phases et la validation.**

**Prêt à implémenter ce protocole de suivi avant de démarrer la Phase 0 ?**
